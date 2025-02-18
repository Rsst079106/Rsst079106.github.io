document.addEventListener("DOMContentLoaded", function () {
    const times = [
        "08:10-09:10", "09:10-10:10", "10:10-11:10", "11:10-12:10",
        "12:10-13:10", "13:10-14:10", "14:10-15:10", "15:10-16:10",
        "16:10-17:10", "17:10-18:10"
    ];

    let bookings = JSON.parse(localStorage.getItem("bookings")) || {};

    function parseTimeToTimestamp(timeStr) {
        let today = new Date();
        let [startHour, startMinute] = timeStr.split("-")[0].split(":");
        today.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
        return today.getTime();
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
        let currentTime = new Date().getTime();
        let today = new Date().toDateString();

        times.forEach(time => {
            let row = document.createElement("tr");
            let timeCell = document.createElement("td");
            timeCell.textContent = time;
            row.appendChild(timeCell);

            let timeSlotStart = parseTimeToTimestamp(time);
            let canBookFrom = timeSlotStart - 3600000;

            if (bookings[time] && bookings[time].date !== today) {
                delete bookings[time];
                localStorage.setItem("bookings", JSON.stringify(bookings));
            }

            let statusCell = document.createElement("td");
            if (bookings[time]) {
                statusCell.textContent = "❌ ถูกจองโดย " + bookings[time].name;
                statusCell.className = "booked";
            } else if (currentTime < canBookFrom) {
                statusCell.textContent = "✅ ว่าง";
                statusCell.className = "expired";
            } else if (currentTime >= timeSlotStart) {
                statusCell.textContent = "✅ ว่าง";
                statusCell.className = "expired";
            } else {
                statusCell.textContent = "✅ ว่าง";
                statusCell.className = "expired";
            }
            row.appendChild(statusCell);

            let actionCell = document.createElement("td");
            if (bookings[time]) {
                let cancelButton = document.createElement("button");
                cancelButton.textContent = "ยกเลิกจอง";
                cancelButton.className = "cancel-btn";
                cancelButton.onclick = function () {
                    let studentId = prompt("กรุณากรอกเลขประจำตัวนักศึกษาเพื่อยกเลิกจอง:");
                    if (studentId === bookings[time].studentId) {
                        delete bookings[time];
                        localStorage.setItem("bookings", JSON.stringify(bookings));
                        updateSchedule();
                    } else {
                        alert("❌ เลขประจำตัวนักศึกษาไม่ถูกต้อง!");
                    }
                };
                actionCell.appendChild(cancelButton);
            } else if (currentTime < canBookFrom) {
                let disabledButton = document.createElement("button");
                disabledButton.textContent = "จอง";
                disabledButton.className = "disabled-btn";
                disabledButton.disabled = true;
                actionCell.appendChild(disabledButton);
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
                        bookings[time] = {
                            name: userName,
                            studentId: studentId,
                            date: today
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
    }
    updateSchedule();
});
