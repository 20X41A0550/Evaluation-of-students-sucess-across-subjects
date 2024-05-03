import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import "./facultyHome.css";
import * as XLSX from "xlsx";

const getResultsBySemester = (selectedSemester, setData) => {
  if (!selectedSemester) {
    return; // Do nothing if semester is not selected
  }

  fetch(`http://localhost:6002/getResultsBySemester?semester=${selectedSemester}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      setData(data);
    })
    .catch((error) => {
      console.error("Failed to fetch data by semester:", error);
    });
};

const FacultyHome = () => {
  const [data, setData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [failedStudents, setFailedStudents] = useState([]);
  const [failedStudentsPage, setFailedStudentsPage] = useState(1);
  const [failedStudentsPerPage] = useState(5);
  const [failedSubnames, setFailedSubnames] = useState([]);
  const [filterSubname, setFilterSubname] = useState("");
  const [sgpaValues, setSgpaValues] = useState({}); // Store SGPA values for each unique HTNO

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  useEffect(() => {
    getResultsBySemester(selectedSemester, setData);
  }, [selectedSemester]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchFailedStudents = () => {
    const failedStudentsData = data.filter((item) => item.Grade === "F");
    setFailedStudents(failedStudentsData);
    setFailedStudentsPage(1);

    const uniqueSubnames = [...new Set(failedStudentsData.map((student) => student.Subname))];
    setFailedSubnames(uniqueSubnames);
  };

  const handleFailedStudentsPageClick = ({ selected }) => {
    setFailedStudentsPage(selected + 1);
  };

  useEffect(() => {
    const calculateSgpa = (htno) => {
      const subjects = data.filter((subj) => subj.Htno === htno);
      const totalCredits = subjects.reduce((total, subj) => total + subj.Credits, 0);
      const totalCp = subjects.reduce((total, subj) => total + calculateCp(subj.Grade, subj.Credits), 0);
      return totalCp / totalCredits;
    };

    const uniqueHtnos = [...new Set(data.map((item) => item.Htno))];
    const sgpaValuesObj = {};
    uniqueHtnos.forEach((htno) => {
      sgpaValuesObj[htno] = calculateSgpa(htno);
    });
    setSgpaValues(sgpaValuesObj);
  }, [data]);

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

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  const downloadResults = () => {
    const filteredData = data.filter((item) => item.Semester === selectedSemester);
    const excelData = [
      ["Htno", "Subject", "Grade", "Credits"],
      ...filteredData.map((item) => [item.Htno, item.Subname, item.Grade, item.Credits]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `results_${selectedSemester}.xlsx`);
  };

  return (
    // <div className="auth-wrapper">
      <div className="auth-inner">
        <h3>Welcome </h3>
        <div className="search-container">
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
          </select>
          <input type="text" placeholder="Search by HTNO" onChange={handleSearch} className="search-bar" />
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Htno</th>
                <th>Subject</th>
                <th>Grade</th>
                <th>Credits</th>
                <th>CP</th>
                <th>SGPA</th> {/* Added SGPA column */}
              </tr>
            </thead>
            <tbody>
              {data
                .filter((item) => item.Htno.includes(searchTerm))
                .slice((currentPage - 1) * subjectsPerPage, currentPage * subjectsPerPage)
                .map((item, index) => (
                  <tr key={index}>
                    <td>{item.Htno}</td>
                    <td>{item.Subname}</td>
                    <td>{item.Grade}</td>
                    <td>{item.Credits}</td>
                    <td>{calculateCp(item.Grade, item.Credits)}</td>
                    <td className="sgpa-column">{sgpaValues[item.Htno] ? sgpaValues[item.Htno].toFixed(2) : ""}</td>

                  </tr>
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
        <div className="failed-students">
          <button onClick={fetchFailedStudents} className="failed-students-btn">
            Show Failed Students
          </button>
          <select onChange={(e) => setFilterSubname(e.target.value)} className="subname-dropdown">
            <option value="">Select Subname</option>
            {failedSubnames.map((subname, index) => (
              <option key={index} value={subname}>
                {subname}
              </option>
            ))}
          </select>
          <table>
            <thead>
              <tr>
                <th>Htno</th>
                <th>Subject</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {failedStudents
                .filter((student) => !filterSubname || student.Subname === filterSubname)
                .slice((failedStudentsPage - 1) * failedStudentsPerPage, failedStudentsPage * failedStudentsPerPage)
                .map((student, index) => (
                  <tr key={index}>
                    <td>{student.Htno}</td>
                    <td>{student.Subname}</td>
                    <td>{student.Grade}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <ReactPaginate
            breakLabel="..."
            nextLabel="next >"
            onPageChange={handleFailedStudentsPageClick}
            pageRangeDisplayed={5}
            pageCount={Math.ceil(failedStudents.length / failedStudentsPerPage)}
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
        </div>
        <button onClick={downloadResults} className="download-btn">
          Download Results
        </button>
      <button onClick={logOut} className="logout-btn">
        Log Out
      </button>
      {/* </div> */}
    </div>
  );
};

export default FacultyHome;
