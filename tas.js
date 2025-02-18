document.addEventListener("DOMContentLoaded", function () {
    const times = [
        "08:10-09:10", "09:10-10:10", "10:10-11:10", "11:10-12:10",
        "12:10-13:10", "13:10-14:10", "14:10-15:10", "15:10-16:10",
        "16:10-17:10", "17:10-18:10", "18:10-19:10", "19:10-20:10"
    ];

    let bookings = JSON.parse(localStorage.getItem("bookings")) || {};

    function getFormattedDate(offset = 0) {
        let date = new Date();
        date.setDate(date.getDate() + offset);
        return date.toISOString().split("T")[0];
    }

    function isStudentAlreadyBooked(studentId) {
        return Object.values(bookings).some(dayBookings =>
            Object.values(dayBookings).some(booking => booking.studentId === studentId)
        );
    }

    function updateSchedule(selectedDate) {
        let scheduleTable = document.getElementById("schedule");
        if (!scheduleTable) {
            console.error("ไม่พบ <tbody id='schedule'> ใน HTML");
            return;
        }

        scheduleTable.innerHTML = "";
        let currentDate = selectedDate;
        let availableCount = 0;
        let bookedCount = 0;

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

            let statusCell = document.createElement("td");
            let actionCell = document.createElement("td");

            if (bookings[currentDate] && bookings[currentDate][time]) {
                let booking = bookings[currentDate][time];
                statusCell.textContent = `❌ ถูกจองโดย ${booking.name}`;
                statusCell.className = "booked";
                bookedCount++;
                
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
                        updateSchedule(selectedDate);
                    } else {
                        alert("❌ เลขประจำตัวนักศึกษาไม่ถูกต้อง!");
                    }
                };
                actionCell.appendChild(cancelButton);
            } else {
                statusCell.textContent = "✅ ว่าง";
                statusCell.className = "available";
                availableCount++;

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
                        updateSchedule(selectedDate);
                    }
                };
                actionCell.appendChild(bookButton);
            }

            row.appendChild(statusCell);
            row.appendChild(actionCell);
            scheduleTable.appendChild(row);
        });

        let summaryRow = document.createElement("tr");
        let summaryCell = document.createElement("td");
        summaryCell.colSpan = 4;
        summaryCell.textContent = `🟢 ว่าง: ${availableCount} | ❌ จองแล้ว: ${bookedCount}`;
        summaryCell.className = "summary";
        summaryRow.appendChild(summaryCell);
        scheduleTable.appendChild(summaryRow);
    }

    let datePicker = document.getElementById("date-picker");
    if (datePicker) {
        datePicker.min = getFormattedDate(0);
        datePicker.max = getFormattedDate(365);
        datePicker.value = getFormattedDate(0);
        datePicker.addEventListener("change", function () {
            updateSchedule(datePicker.value);
        });
        updateSchedule(datePicker.value);
    } else {
        console.error("ไม่พบ <input id='date-picker'> ใน HTML");
    }
});
