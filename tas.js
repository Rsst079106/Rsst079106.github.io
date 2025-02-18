document.addEventListener("DOMContentLoaded", function () {
    const times = [
        "08:10-09:10", "09:10-10:10", "10:10-11:10", "11:10-12:10",
        "12:10-13:10", "13:10-14:10", "14:10-15:10", "15:10-16:10",
        "16:10-17:10", "17:10-18:10"
    ];

    let bookings = JSON.parse(localStorage.getItem("bookings")) || {};

    function getFormattedDate(offset = 0) {
        let date = new Date();
        date.setDate(date.getDate() + offset);
        return date.toISOString().split("T")[0]; // YYYY-MM-DD
    }

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
        let currentTime = new Date().getTime();

        [0, 1].forEach(offset => {
            let currentDate = getFormattedDate(offset);
            let dateHeader = document.createElement("tr");
            let dateCell = document.createElement("td");
            dateCell.colSpan = 4;
            dateCell.textContent = `📅 วันที่: ${currentDate}`;
            dateCell.className = "date-header";
            dateHeader.appendChild(dateCell);
            scheduleTable.appendChild(dateHeader);

            times.forEach(time => {
                let row = document.createElement("tr");

                let dateCell = document.createElement("td");
                dateCell.textContent = currentDate;
                row.appendChild(dateCell);

                let timeCell = document.createElement("td");
                timeCell.textContent = time;
                row.appendChild(timeCell);

                let timeSlotStart = parseTimeToTimestamp(currentDate, time);
                let canBookFrom = timeSlotStart - 3600000;

                if (bookings[currentDate] && bookings[currentDate][time]) {
                    let booking = bookings[currentDate][time];
                    let statusCell = document.createElement("td");
                    statusCell.textContent = `❌ ถูกจองโดย ${booking.name}`;
                    statusCell.className = "booked";
                    row.appendChild(statusCell);

                    let actionCell = document.createElement("td");
                    let cancelButton = document.createElement("button");
                    cancelButton.textContent = "ยกเลิกจอง";
                    cancelButton.className = "cancel-btn";
                    cancelButton.onclick = function () {
                        let studentId = prompt("กรุณากรอกเลขประจำตัวนักศึกษาเพื่อยกเลิกจอง:");
                        if (studentId === booking.studentId) {
                            delete bookings[currentDate][time];
                            if (Object.keys(bookings[currentDate]).length === 0) {
                                delete bookings[currentDate];
                            }
                            localStorage.setItem("bookings", JSON.stringify(bookings));
                            updateSchedule();
                        } else {
                            alert("❌ เลขประจำตัวนักศึกษาไม่ถูกต้อง!");
                        }
                    };
                    actionCell.appendChild(cancelButton);
                    row.appendChild(actionCell);
                } else {
                    let statusCell = document.createElement("td");
                    statusCell.textContent = "✅ ว่าง";
                    statusCell.className = (currentTime >= timeSlotStart) ? "expired" : "available";
                    row.appendChild(statusCell);

                    let actionCell = document.createElement("td");
                    if (currentTime >= timeSlotStart) {
                        let expiredButton = document.createElement("button");
                        expiredButton.textContent = "จอง";
                        expiredButton.className = "disabled-btn";
                        expiredButton.disabled = true;
                        actionCell.appendChild(expiredButton);
                    } else {
                        let bookButton = document.createElement("button");
                        bookButton.textContent = "จอง";
                        bookButton.className = "book-btn";
                        bookButton.onclick = function () {
                            let userName = prompt("กรุณากรอกชื่อของคุณ:");
                            let studentId = prompt("กรุณากรอกเลขประจำตัวนักศึกษา:");
                            if (userName && studentId) {
                                if (isStudentAlreadyBooked(studentId)) {
                                    alert("❌ คุณสามารถจองได้เพียง 1 รอบเท่านั้น!");
                                    return;
                                }
                                if (!bookings[currentDate]) bookings[currentDate] = {};
                                bookings[currentDate][time] = {
                                    name: userName,
                                    studentId: studentId
                                };
                                localStorage.setItem("bookings", JSON.stringify(bookings));
                                updateSchedule();
                            }
                        };
                        actionCell.appendChild(bookButton);
                    }
                    row.appendChild(actionCell);
                }

                scheduleTable.appendChild(row);
            });
        });
    }
    updateSchedule();
});