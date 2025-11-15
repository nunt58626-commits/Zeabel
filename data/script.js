let currentData = []; // เก็บข้อมูลปัจจุบันสำหรับ render และ export

// โหลดข้อมูลจาก GitHub หรือ localStorage
async function loadData() {
    const url = "https://raw.githubusercontent.com/nunt58626-commits/Zeabel/main/data/stock-history.json";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const stored = JSON.parse(localStorage.getItem("stockMovements")) || [];
        currentData = stored.length > 0 ? stored : data;
        renderTable(currentData);
    } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว:", err);
        currentData = JSON.parse(localStorage.getItem("stockMovements")) || [];
        renderTable(currentData);
    }
}

// เพิ่มรายการใหม่
function addStockMove(record) {
    currentData.push(record);
    localStorage.setItem("stockMovements", JSON.stringify(currentData));
    renderTable(currentData);
}

// แสดงตาราง
function renderTable(data) {
    const container = document.getElementById("historyTableContainer");
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = '<p class="text-center mt-3">ยังไม่มีประวัติการเคลื่อนย้ายสินค้า</p>';
        return;
    }

    let tableHTML = `
    <div class="table-responsive">
    <table class="table table-striped table-bordered">
        <thead class="table-dark">
            <tr>
                <th>รหัสสินค้า</th>
                <th>จำนวนลัง</th>
                <th>จากตำแหน่ง</th>
                <th>ไปตำแหน่ง</th>
                <th>วันผลิต</th>
                <th>วันหมดอายุ</th>
                <th>เวลาบันทึก</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach(item => {
        const timestampStr = new Date(item.timestamp).toLocaleString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        tableHTML += `
            <tr>
                <td>${item.productCode}</td>
                <td>${item.quantity}</td>
                <td>${item.locationFrom}</td>
                <td>${item.locationTo}</td>
                <td>${item.mfgDate}</td>
                <td>${item.expDate}</td>
                <td>${timestampStr}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table></div>';
    container.innerHTML = tableHTML;
}

// 🔥 ส่งออกเป็นไฟล์ Excel (XLSX) — อ่านไทยได้ 100%
function exportXLSX() {
    if (!currentData || currentData.length === 0) {
        return alert("ไม่มีข้อมูลสำหรับส่งออก");
    }

    // จัดข้อมูลให้เป็น key ภาษาไทย เพื่อให้ header ใน Excel ตรงกับตาราง
    const exportData = currentData.map(item => ({
        "รหัสสินค้า": item.productCode,
        "จำนวนลัง": item.quantity,
        "จากตำแหน่ง": item.locationFrom,
        "ไปตำแหน่ง": item.locationTo,
        "วันผลิต": item.mfgDate,
        "วันหมดอายุ": item.expDate,
        "เวลาบันทึก": new Date(item.timestamp).toLocaleString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })
    }));

    // แปลงเป็น worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // สร้าง workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockHistory");

    // ดาวน์โหลดไฟล์ Excel
    XLSX.writeFile(wb, "stock-history.xlsx");
}

// เรียกใช้เมื่อโหลดหน้า
window.onload = () => {
    loadData();
};
