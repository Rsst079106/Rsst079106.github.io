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
        return Object.values(bookings).some(dayBookings =>
            Object.values(dayBookings).some(booking => booking.studentId === studentId)
        );
    }

    function updateSchedule() {
        let scheduleTable = document.getElementById("schedule");
        if (!scheduleTable) {
            console.error("ไม่พบ <tbody id='schedule'> ใน HTML");
            return;
        }

        scheduleTable.innerHTML = "";

        [0, 1].forEach(offset => {
            let currentDate = getFormattedDate(offset);
            let availableCount = 0; // ตัวนับช่องที่ว่าง

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

                let statusCell = document.createElement("td");
                let actionCell = document.createElement("td");

                if (bookings[currentDate] && bookings[currentDate][time]) {
                    let booking = bookings[currentDate][time];
                    statusCell.textContent = `❌ ถูกจองโดย ${booking.name}`;
                    statusCell.className = "booked";
                    
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
                } else {
                    statusCell.textContent = "✅ ว่าง";
                    statusCell.className = "available";
                    availableCount++; // เพิ่มตัวนับช่องที่ว่าง

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

                row.appendChild(statusCell);
                row.appendChild(actionCell);
                scheduleTable.appendChild(row);
            });

            // แสดงจำนวนเวลาที่ว่างทั้งหมดของวันนั้น
            let availableRow = document.createElement("tr");
            let availableCell = document.createElement("td");
            availableCell.colSpan = 4;
            availableCell.textContent = `🟢 สถานะว่างทั้งหมด: ${availableCount} ช่วงเวลา`;
            availableCell.className = "available-summary";
            availableRow.appendChild(availableCell);
            scheduleTable.appendChild(availableRow);
        });
    }

    updateSchedule();
});
