import React, { useEffect, useState } from "react";
import ReactPaginate from 'react-paginate';
import "./userHome.css";

const UserHome = () => {
  const [data, setData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [sgpa, setSgpa] = useState(null);
  const [percentage, setPercentage] = useState(null);
  const [overallVisible, setOverallVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectsPerPage, setSubjectsPerPage] = useState(9);
  const Htno = localStorage.getItem('Htno');

  useEffect(() => {
    setSelectedSemester("");
    setOverallVisible(false);
    setData([]);
    setSgpa(null);
    setPercentage(null);
    setCurrentPage(1);
  }, [Htno]);

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
    setOverallVisible(e.target.value === "overall");
    fetchData(e.target.value);
    setSubjectsPerPage(getSubjectsPerPage(e.target.value));
  };

  const getSubjectsPerPage = (semester) => {
    switch (semester) {
      case "1-1":
      case "4-1":
        return 8;
      case "4-2":
        return 1;
      default:
        return 9; // Default value for other semesters
    }
  };

  const fetchData = (semester) => {
    const url = semester === "overall"
      ? `http://localhost:6001/getResultsByHtnoOverall?Htno=${Htno}`
      : `http://localhost:6001/getResultsByHtnoAndSemester?semester=${semester}&Htno=${Htno}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setData(data);
          setSgpa(null);
          setPercentage(null);
        } else {
          setData([]);
          setSgpa(null);
          setPercentage(null);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      });
  };

  const calculateCp = (grade, credits) => {
    let gpValue;
    switch (grade) {
      case "A+":
        gpValue = 10;
        break;
      case "A":
        gpValue = 9;
        break;
      case "B":
        gpValue = 8;
        break;
      case "C":
        gpValue = 7;
        break;
      case "D":
        gpValue = 6;
        break;
      case "E":
        gpValue = 5;
        break;
      case "F":
        gpValue = 0;
        break;
      default:
        gpValue = 0;
    }
    return gpValue * credits;
  };

  const calculateSgpa = () => {
    let totalCredits = 0;
    let totalCp = 0;
    data.forEach((subject) => {
      totalCredits += subject.Credits;
      totalCp += calculateCp(subject.Grade, subject.Credits);
    });
    const sgpaValue = totalCp / totalCredits;
    setSgpa(sgpaValue.toFixed(2));
  };

  const calculatePercentage = () => {
    const percentageValue = (sgpa - 0.75) * 10;
    setPercentage(percentageValue.toFixed(2));
  };

  const calculateFailedSubjects = () => {
    const failedSubjects = data.filter((subject) => subject.Grade === "F");
    return failedSubjects.length;
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalCp = 0;
    data.forEach((subject) => {
      totalCredits += subject.Credits;
      totalCp += calculateCp(subject.Grade, subject.Credits);
    });
  
    // Adjust total credits based on the selected semester
    switch (selectedSemester) {
      case "1-1":
      case "1-2":
        totalCredits = 19.5;
        break;
      case "2-1":
      case "2-2":
      case "3-1":
      case "3-2":
        totalCredits = 21.5;
        break;
      case "4-1":
        totalCredits = 23.0;
        break;
      case "4-2":
        totalCredits = 12.0;
        break;
      default:
        break;
    }
  
    const cgpa = totalCp / totalCredits;
    return cgpa.toFixed(2);
  };
  

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  const handlePageClick = (selectedPage) => {
    setCurrentPage(selectedPage.selected + 1);
  };

  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = data.slice(indexOfFirstSubject, indexOfLastSubject);

  return (
    // <div className="auth-wrapper">
      <div className="auth-inner">
      <h3>Welcome {Htno}</h3>

        <div className="semester-dropdown-container">
          <select value={selectedSemester} onChange={handleSemesterChange} className="semester-dropdown">
            <option value="">Select Semester</option>
            <option value="1-1">1-1</option>
            <option value="1-2">1-2</option>
            <option value="2-1">2-1</option>
            <option value="2-2">2-2</option>
            <option value="3-1">3-1</option>
            <option value="3-2">3-2</option>
            <option value="4-1">4-1</option>
            <option value="4-2">4-2</option>
            <option value="overall">Overall</option>
          </select>
        </div>
        <div className="table-container">
          <table>
            {/* Table header */}
            <thead>
              <tr>
                <th>Htno</th>
                <th>Subname</th>
                <th>Grade</th>
                <th>Credits</th>
                <th>CP</th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {currentSubjects.map((i, index) => (
                // Only display the first 8 subjects for 1-1 semester
                selectedSemester === "1-1" && index >= 8 ? null : (
                  <tr key={index}>
                    <td>{i.Htno}</td>
                    <td>{i.Subname}</td>
                    <td>{i.Grade}</td>
                    <td>{i.Credits}</td>
                    <td>{calculateCp(i.Grade, i.Credits)}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={Math.ceil(data.length / subjectsPerPage)}
          marginPagesDisplayed={2}
          containerClassName="pagination justify-content-center"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          activeClassName="active"
        />
        {/* Additional components for calculating SGPA, percentage, etc. */}
        
        {overallVisible && (
          <div>
            <button onClick={() => {
              const cgpaValue = calculateCGPA();
              setSgpa(cgpaValue);
            }} className="calculate-btn">
              Calculate CGPA
            </button>
            <button onClick={calculatePercentage} className="calculate-btn">
              Calculate Percentage
            </button>
            {sgpa && <p>CGPA: {sgpa}</p>}
          </div>
        )}

        {selectedSemester !== "overall" && (
          <div className="stats-container">
            <button onClick={calculateSgpa} className="calculate-btn">
              Calculate SGPA
            </button>
            <button onClick={calculatePercentage} className="calculate-btn">
              Calculate Percentage
            </button>
          </div>
        )}
        {sgpa && <p>SGPA: {sgpa}</p>}
        {percentage && <p>Percentage: {percentage}%</p>}
        {data.length > 0 && (
          <p>Total Subjects Failed: {calculateFailedSubjects()}</p>
        )}
        {/* Log out button */}
        <button onClick={logOut} className="logout-btn">
          Log Out
        </button>
      </div>
    // </div>
  );
};

export default UserHome;
