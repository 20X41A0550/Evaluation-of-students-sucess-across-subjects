import React, { useEffect, useState, useCallback } from "react";
import { faTrash, faSearch, faUserPlus, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AdminHome() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createUserData, setCreateUserData] = useState({});
  const [updateUserData, setUpdateUserData] = useState(null);

  const getAllUser = useCallback(() => {
    fetch(`http://localhost:5000/getAllUser?search=${searchQuery}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data.data);
      });
  }, [searchQuery]);

  useEffect(() => {
    getAllUser();
  }, [searchQuery, getAllUser]);

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  const deleteUser = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}`)) {
      fetch("http://localhost:5000/deleteUser", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          userid: id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.data);
          getAllUser();
        });
    }
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchQuery(value);
  };

  const handleCreateUserChange = (e) => {
    const { name, value } = e.target;
    setCreateUserData({
      ...createUserData,
      [name]: value,
    });
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if ((createUserData.userType === "Student" && createUserData.lname && createUserData.email && createUserData.Htno && createUserData.password) ||
        ((createUserData.userType === "Admin" || createUserData.userType === "Faculty") && createUserData.lname && createUserData.email && createUserData.id && createUserData.password)) {
      // Create user
      createUser(createUserData, setData);
      setCreateUserData({});
    } else {
      alert("Please enter all details");
    }
  };

  const createUser = (user, updateData) => {
    fetch("http://localhost:5000/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message); // Show success message
        if (data.data) {
          setData([...data, data.data]); // Add new user to the data array
        }
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });
  };

  const handleUpdateUserSubmit = (updatedUserData) => {
    fetch(`http://localhost:5000/updateUser/${updatedUserData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(updatedUserData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message); // Show success message
        setUpdateUserData(null); // Clear the update form
        getAllUser(); // Refresh the user list
      });
  };

  return (
    <div className="auth-wrapper" style={{ height: "auto", marginTop: 50 }}>
      <div className="auth-inner" style={{ width: "fit-content" }}>
        <h3>Welcome Admin</h3>
        <div>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <FontAwesomeIcon
              icon={faSearch}
              style={{ position: "absolute", left: 10, top: 13, color: "black" }}
            />
            <input
              type="text"
              placeholder="Search..."
              onChange={handleSearch}
              style={{
                padding: "8px 32px 8px 32px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <span
              style={{ position: "absolute", right: 10, top: 8, color: "#aaa" }}
            >
              {searchQuery.length > 0 ? `Records Found ${data.length}` : `Total Records ${data.length}`}
            </span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setCreateUserData({})}
            style={{ marginBottom: 10 }}
          >
            <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: 5 }} />
            Create User
          </button>
          {!createUserData.fname && (
            <form onSubmit={handleCreateUserSubmit}>
              <input
                type="text"
                name="lname"
                placeholder="Name"
                value={createUserData.lname || ""}
                onChange={handleCreateUserChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={createUserData.email || ""}
                onChange={handleCreateUserChange}
              />
              {createUserData.userType === "Student" && (
                <>
                  <input
                    type="text"
                    name="Htno"
                    placeholder="HTNO"
                    value={createUserData.Htno || ""}
                    onChange={handleCreateUserChange}
                  />
                </>
              )}
              {createUserData.userType === "Admin" && (
                <>
                  <input
                    type="text"
                    name="id"
                    placeholder="ID"
                    value={createUserData.id || ""}
                    onChange={handleCreateUserChange}
                  />
                </>
              )}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={createUserData.password || ""}
                onChange={handleCreateUserChange}
              />
              <input
                type="text"
                name="userType"
                placeholder="User Type"
                value={createUserData.userType || ""}
                onChange={handleCreateUserChange}
              />
              <button type="submit">
                <FontAwesomeIcon icon={faSave} style={{ marginRight: 5 }} />
                Save
              </button>
            </form>
          )}
          {updateUserData && (
            <form onSubmit={() => handleUpdateUserSubmit(updateUserData)}>
              {/* Update form inputs */}
            </form>
          )}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>User Type</th>
                <th>ID</th>
                <th>Delete</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) &&
                data.map((i) => (
                  <tr key={i._id}>
                    <td>{i.lname}</td>
                    <td>{i.email}</td>
                    <td>{i.userType}</td>
                    <td>{i.userType === "Student" ? i.Htno : i.id}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={faTrash}
                        onClick={() => deleteUser(i._id, i.fname)}
                      />
                    </td>
                    <td>
                      <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => setUpdateUserData(i)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <button onClick={logOut} className="btn btn-primary" style={{ marginTop: 10 }}>
          Log Out
        </button>
      </div>
    </div>
  );
}
