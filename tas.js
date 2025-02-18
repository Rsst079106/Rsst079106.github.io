document.addEventListener("DOMContentLoaded", function () {
    const times = [
        "08:10-09:10", "09:10-10:10", "10:10-11:10", "11:10-12:10",
        "12:10-13:10", "13:10-14:10", "14:10-15:10", "15:10-16:10",
        "16:10-17:10", "17:10-18:10"
    ];
    
    let bookings = JSON.parse(localStorage.getItem("bookings")) || {};
    
    function parseTimeToTimestamp(dateStr, timeStr) {
        let date = new Date(dateStr);
        let [startHour, startMinute] = timeStr.split("-")[0].split(":");
        date.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
        return date.getTime();
    }
    
    function isStudentAlreadyBooked(studentId) {
        return Object.values(bookings).some(booking => booking.studentId === studentId);
    }
    
    function updateSchedule() {
        let scheduleTable = document.getElementById("schedule");
        if (!scheduleTable) {
            console.error("ไม่พบ <tbody id='schedule'> ใน HTML");
            return;
        }

        scheduleTable.innerHTML = "";
        let today = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        let dateOptions = [today.toDateString(), tomorrow.toDateString()];
        
        dateOptions.forEach(dateStr => {
            let dateHeader = document.createElement("tr");
            let dateCell = document.createElement("td");
            dateCell.colSpan = 3;
            dateCell.textContent = dateStr;
            dateCell.className = "date-header";
            dateHeader.appendChild(dateCell);
            scheduleTable.appendChild(dateHeader);

            let currentTime = new Date().getTime();
            
            times.forEach(time => {
                let row = document.createElement("tr");
                let timeCell = document.createElement("td");
                timeCell.textContent = time;
                row.appendChild(timeCell);
                
                let timeSlotStart = parseTimeToTimestamp(dateStr, time);
                let canBookFrom = timeSlotStart - 3600000;
                
                if (bookings[dateStr]?.[time] && new Date(bookings[dateStr][time].date).toDateString() !== dateStr) {
                    delete bookings[dateStr][time];
                    localStorage.setItem("bookings", JSON.stringify(bookings));
                }
                
                let statusCell = document.createElement("td");
                if (bookings[dateStr]?.[time]) {
                    statusCell.textContent = "❌ ถูกจองโดย " + bookings[dateStr][time].name;
                    statusCell.className = "booked";
                } else if (currentTime < canBookFrom) {
                    statusCell.textContent = "✅ ว่าง";
                    statusCell.className = "available";
                } else if (currentTime >= timeSlotStart) {
                    statusCell.textContent = "⏳ หมดเวลา";
                    statusCell.className = "expired";
                } else {
                    statusCell.textContent = "✅ ว่าง";
                    statusCell.className = "available";
                }
                row.appendChild(statusCell);
                
                let actionCell = document.createElement("td");
                if (bookings[dateStr]?.[time]) {
                    let cancelButton = document.createElement("button");
                    cancelButton.textContent = "ยกเลิกจอง";
                    cancelButton.className = "cancel-btn";
                    cancelButton.onclick = function () {
                        let studentId = prompt("กรุณากรอกเลขประจำตัวนักศึกษาเพื่อยกเลิกจอง:");
                        if (studentId === bookings[dateStr][time].studentId) {
                            delete bookings[dateStr][time];
                            localStorage.setItem("bookings", JSON.stringify(bookings));
                            updateSchedule();
                        } else {
                            alert("❌ เลขประจำตัวนักศึกษาไม่ถูกต้อง!");
                        }
                    };
                    actionCell.appendChild(cancelButton);
                } else if (currentTime >= timeSlotStart) {
                    let expiredButton = document.createElement("button");
                    expiredButton.textContent = "จอง";
                    expiredButton.className = "book-btn";
                    expiredButton.disabled = true;
                    actionCell.appendChild(expiredButton);
                } else {
                    let bookButton = document.createElement("button");
                    bookButton.textContent = "จอง";
                    bookButton.className = "book-btn";
                    bookButton.onclick = function () {
                        let userName = prompt("กรุณากรอกชื่อของคุณ:");
                        let studentId = prompt("กรุณากรอกเลขประจำตัวนักศึกษา:");
                        let department = prompt("กรุณากรอกแผนก/สาขา:");
                        if (userName && studentId) {
                            if (isStudentAlreadyBooked(studentId)) {
                                alert("❌ คุณสามารถจองได้เพียง 1 รอบเท่านั้น!");
                                return;
                            }
                            if (!bookings[dateStr]) {
                                bookings[dateStr] = {};
                            }
                            bookings[dateStr][time] = {
                                name: userName,
                                studentId: studentId,
                                department: department,
                                date: dateStr
                            };
                            localStorage.setItem("bookings", JSON.stringify(bookings));
                            updateSchedule();
                        }
                    };
                    actionCell.appendChild(bookButton);
                }
                row.appendChild(actionCell);
                scheduleTable.appendChild(row);
            });
        });
    }
    updateSchedule();
});
