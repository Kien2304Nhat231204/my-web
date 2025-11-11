// ===== HÀM TIỆN ÍCH =====
function $(id){return document.getElementById(id);}
function loadData(key){return JSON.parse(localStorage.getItem(key)||"[]");}
function saveData(key,data){localStorage.setItem(key,JSON.stringify(data));}
function generateId(){return 'a'+Date.now()+Math.floor(Math.random()*1000);}

// ===== KHỞI TẠO DỮ LIỆU =====
if(!localStorage.getItem("users")) saveData("users", []);
// THÊM MỚI: tạo mảng appointments rỗng nếu chưa có
if(!localStorage.getItem("appointments")) saveData("appointments", []);

// ===== DANH SÁCH BÁC SĨ =====
const doctors = [
  {name:"Trần Thị Thanh Thảo",phone:"0987654321",spec:"Sản phụ khoa",img:"https://images.unsplash.com/photo-1607746882042-944635dfe10e"},
  {name:"Nguyễn Anh Tuấn",phone:"0978123456",spec:"Ngoại khoa", img:"https://images.unsplash.com/photo-1588776814546-1ffcf47267a5"},
  {name:"Lê Văn Lâm",phone:"0966789012",spec:"Sản phụ khoa", img:"https://images.unsplash.com/photo-1537368910025-700350fe46c7"},
  {name:"Vũ Minh Trung",phone:"0905432187",spec:"Nội tim mạch", img:"https://images.unsplash.com/photo-1550831107-1553da8c8464"},
  {name:"Hà Thu Hương",phone:"0912345678",spec:"Nhi khoa", img:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1"},
  {name:"Nguyễn Ngọc Diệp",phone:"0923567890",spec:"Nội tim mạch", img:"https://images.pexels.com/photos/5214995/pexels-photo-5214995.jpeg"},
  {name:"Nguyễn Thị Vân",phone:"0938246135",spec:"Nhi khoa", img:"https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg"},
  {name:"Masic Vera",phone:"0945789624",spec:"Nội tổng hợp", img:"https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg"},
  {name:"Võ Thị Ánh Xuân",phone:"0886123789",spec:"Ngoại khoa", img:"https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg"},
  {name:"Phoguster",phone:"0899456102",spec:"Nội tổng hợp", img:"https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg"}
];

// ===== ĐĂNG KÝ =====
function registerUser(){
  let name=$("regName").value.trim();
  let phone=$("regPhone").value.trim();
  let pass=$("regPass").value.trim();
  if(!name||!phone||!pass){alert("Vui lòng nhập đầy đủ thông tin!");return;}
  let users=loadData("users");
  if(users.find(u=>u.phone===phone)){alert("SĐT đã tồn tại!");return;}
  users.push({name,phone,pass,role:"patient"});
  saveData("users",users);
  alert("Đăng ký thành công! Hãy đăng nhập.");
  location.href="login.html";
}

// ===== ĐĂNG NHẬP =====
function loginUser(){
  let phone=$("loginPhone").value.trim();
  let pass=$("loginPass").value.trim();
  if(phone==="Kienmaster" && pass==="231204@"){
    sessionStorage.setItem("currentUser", JSON.stringify({name:"Quản trị viên", phone, role:"admin"}));
    alert("Đăng nhập thành công với quyền Admin!");
    location.href="admin.html"; return;
  }
  let users=loadData("users");
  let u=users.find(x=>x.phone===phone && x.pass===pass);
  if(!u){alert("Sai thông tin đăng nhập!");return;}
  sessionStorage.setItem("currentUser", JSON.stringify(u));
  if(u.role==="doctor") location.href="doctor.html";
  else location.href="patient.html";
}

// ===== KIỂM TRA QUYỀN =====
function checkAdmin(){let u=JSON.parse(sessionStorage.getItem("currentUser")||"null");if(!u||u.role!=="admin"){alert("Bạn không có quyền!");location.href="login.html";}}
function checkDoctor(){let u=JSON.parse(sessionStorage.getItem("currentUser")||"null");if(!u||u.role!=="doctor"){alert("Không có quyền truy cập!");location.href="login.html";}}
function checkPatient(){let u=JSON.parse(sessionStorage.getItem("currentUser")||"null");if(!u||u.role!=="patient"){alert("Không có quyền truy cập!");location.href="login.html";}}
function logout(){sessionStorage.removeItem("currentUser");location.href="index.html";}

// ===== ĐẶT LỊCH CHUNG =====
function bookAppointmentFromForm(){
  const name = $("bName").value.trim();
  const phone = $("bPhone").value.trim();
  const date = $("bDate").value;
  const spec = $("bSpec").value;
  const note = $("bNote").value.trim();
  const doctorSelect = document.getElementById("bDoctor");
  const doctor = doctorSelect ? doctorSelect.value : "";

  if(!name||!phone||!date||!spec){alert("Vui lòng nhập đầy đủ thông tin!");return;}
  const users = loadData("users");
  if(!users.find(u=>u.name===name && u.phone===phone && u.role==="patient")){
    alert("Vui lòng đăng ký trước khi đặt lịch!");
    location.href="register.html"; return;
  }
  let appointments = loadData("appointments");
  // THÊM DOCTOR nếu có chọn
  appointments.push({appointmentId:generateId(),name,phone,date,spec,note,doctor,examDate:"",examTime:"",result:""});
  saveData("appointments",appointments);
  alert("Đặt lịch thành công!");
  loadPatientPage();
}

// ===== ĐẶT LỊCH TỪ DANH SÁCH BÁC SĨ =====
let selectedDoctor = null;
let selectedSpec = null;
function showDoctorBookingForm(doctorName, spec){
  selectedDoctor = doctorName;
  selectedSpec = spec;
  const formDiv = $("doctorBookingForm");
  formDiv.style.display = "block";
  $("formDoctorName").innerText = doctorName;
  $("doctorDate").value = "";
  $("doctorNote").value = "";
  formDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}
function cancelDoctorBooking(){
  $("doctorBookingForm").style.display="none";
  selectedDoctor = null;
  selectedSpec = null;
}
function submitDoctorBooking(){
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  if(!user){ alert("Bạn chưa đăng nhập!"); return; }
  const date = $("doctorDate").value;
  const note = $("doctorNote").value.trim();
  if(!date || !note){alert("Vui lòng nhập đầy đủ ngày và tình trạng sức khỏe!"); return;}
  let appointments = loadData("appointments");
  appointments.push({
    appointmentId: generateId(),
    name: user.name,
    phone: user.phone,
    date: date,
    spec: selectedSpec,
    note: note,
    doctor: selectedDoctor,
    examDate: "",
    examTime: "",
    result: ""
  });
  saveData("appointments", appointments);
  alert("Đặt lịch thành công!");
  cancelDoctorBooking();
  loadPatientPage();
}

// ===== CẬP NHẬT KẾT QUẢ KHÁM TỪ BÁC SĨ =====
function updateExamResult(appointmentId){
  const examDate = $(`examDate-${appointmentId}`).value;
  const examTime = $(`examTime-${appointmentId}`).value;
  const result = $(`examResult-${appointmentId}`).value.trim();
  if(!examDate || !examTime || !result){alert("Vui lòng nhập đầy đủ ngày, giờ và kết quả khám!"); return;}
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const doctorInfo = doctors.find(d=>d.name===user.name && d.phone.replace(/\D/g,'')===user.phone.replace(/\D/g,'')) || {spec:"Chưa cập nhật"};
  let appointments = loadData("appointments");
  let a = appointments.find(x => x.appointmentId === appointmentId);
  if(!a){ alert("Không tìm thấy bệnh nhân hoặc đã cập nhật!"); return; }
  a.examDate = examDate;
  a.examTime = examTime;
  a.result = result;
  a.doctor = doctorInfo.name;
  saveData("appointments", appointments);
  alert("Đã lưu kết quả khám!");
  loadDoctorDashboard();
}

// ===== TRANG BỆNH NHÂN =====
function loadPatientPage(){
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  if(!user) return;
  document.querySelector("h2").innerText = `Xin chào ${user.name}!`;
  $("infoName").innerText = user.name;
  $("infoPhone").innerText = user.phone;
  $("infoRole").innerText = user.role;

  const appointments = loadData("appointments").filter(a => a.phone===user.phone);
  const myAppDiv = $("myAppointments");
  if(appointments.length===0){ myAppDiv.innerHTML = "<p>Chưa có lịch khám nào.</p>"; }
  else{
    let html=`<table><tr><th>Bác sĩ</th><th>Chuyên khoa</th><th>Ngày đặt</th><th>Ghi chú</th><th>Ngày BS</th><th>Giờ BS</th><th>Kết quả</th></tr>`;
    appointments.forEach(a=>{
      html+=`<tr>
        <td>${a.doctor||"-"}</td>
        <td>${a.spec}</td>
        <td>${a.date}</td>
        <td>${a.note||"-"}</td>
        <td>${a.examDate||"-"}</td>
        <td>${a.examTime||"-"}</td>
        <td>${a.result||"-"}</td>
      </tr>`;
    });
    html+="</table>";
    myAppDiv.innerHTML=html;
  }

  const docDiv = $("doctorList"); docDiv.innerHTML="";
  doctors.forEach(d=>{
    const card = document.createElement("div"); card.className="doctor-card";
    card.innerHTML = `<img src="${d.img||'https://i.pravatar.cc/150?img=12'}" alt="BS">
      <div><p><b>${d.name}</b></p><p>${d.spec}</p><p>SĐT: ${d.phone}</p>
      <button onclick="showDoctorBookingForm('${d.name}','${d.spec}')">Đặt lịch</button></div>`;
    docDiv.appendChild(card);
  });

  const specSelect = $("bSpec");
  if(specSelect) specSelect.innerHTML = [...new Set(doctors.map(d=>d.spec))].map(s=>`<option value="${s}">${s}</option>`).join('');
}

// ===== TRANG BÁC SĨ =====
function loadDoctorDashboard(){
  checkDoctor();
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const doctorInfo = doctors.find(d=>d.name===user.name && d.phone.replace(/\D/g,'')===user.phone.replace(/\D/g,''))||{name:user.name,spec:"Chưa cập nhật"};
  $("doctorInfo").innerText=`Xin chào: BS. ${doctorInfo.name} — Chuyên khoa: ${doctorInfo.spec}`;

  const appointments = loadData("appointments").filter(a=>a.spec===doctorInfo.spec);
  const container = $("patientList");
  if(appointments.length===0){container.innerHTML="<p>Hiện chưa có bệnh nhân nào đặt lịch trong khoa của bạn.</p>"; return;}
  let html=`<table class="patient-table"><tr><th>Họ tên</th><th>SĐT</th><th>Ngày đặt</th><th>Ghi chú</th><th>Ngày khám</th><th>Giờ khám</th><th>Kết quả</th><th>Phản hồi</th></tr>`;
  appointments.forEach(a=>{
    html+=`<tr>
      <td>${a.name}</td><td>${a.phone}</td><td>${a.date}</td><td>${a.note||"-"}</td>
      <td><input type="date" id="examDate-${a.appointmentId}" value="${a.examDate||''}" style="width:120px;"></td>
      <td><input type="time" id="examTime-${a.appointmentId}" value="${a.examTime||''}" style="width:90px;"></td>
      <td><input type="text" id="examResult-${a.appointmentId}" value="${a.result||''}" placeholder="Kết quả" style="width:150px;"></td>
      <td><button onclick="updateExamResult('${a.appointmentId}')">Lưu</button></td>
    </tr>`;
  });
  html+="</table>";
  container.innerHTML=html;
}

// ===== ADMIN - CẤP QUYỀN BÁC SĨ =====
function grantDoctorRole(){
  const name = $("docName").value.trim();
  const phone = $("docPhone").value.trim();
  const pass = $("docPass").value.trim() || "123456";
  if(!name || !phone){ alert("Vui lòng nhập đầy đủ tên và số điện thoại!"); return; }
  let users = loadData("users");
  let user = users.find(u => u.phone === phone);
  if(user){ user.role = "doctor"; user.name = name; }
  else { users.push({name, phone, pass, role:"doctor"}); }
  saveData("users", users);
  alert("Cấp quyền bác sĩ thành công!");
  $("docName").value = $("docPhone").value = $("docPass").value = "";
  if(typeof displayUsers === "function") displayUsers();
}

// ===== DANH SÁCH BỆNH NHÂN CHO ADMIN =====
function showPatientsList(){
  const patients = loadData("users").filter(u=>u.role==="patient");
  const appointments = loadData("appointments") || [];
  const container = $("patientListContainer");
  if(patients.length === 0){
    container.innerHTML = "<p>Chưa có bệnh nhân nào.</p>";
    return;
  }
  let html = `<table class="patient-table">
    <tr><th>STT</th><th>Tên</th><th>SĐT</th><th>Ngày đặt</th><th>Chuyên khoa</th><th>Bác sĩ</th><th>Kết quả</th><th>Thao tác</th></tr>`;
  let count = 1;
  patients.forEach(p => {
    const patientAppointments = appointments.filter(a => a.phone === p.phone);
    if(patientAppointments.length === 0){
      html += `<tr><td>${count++}</td><td>${p.name}</td><td>${p.phone}</td><td colspan="5">Chưa có lịch khám</td></tr>`;
    } else {
      patientAppointments.forEach(a => {
        html += `<tr>
          <td>${count}</td>
          <td>${p.name}</td>
          <td>${p.phone}</td>
          <td>${a.date}</td>
          <td>${a.spec}</td>
          <td>${a.doctor || "-"}</td>
          <td>${a.result || "-"}</td>
          <td><button class="delete-btn" onclick="deleteSingleRecord('${a.appointmentId}')">Xóa</button></td>
        </tr>`;
        count++;
      });
    }
  });
  html += "</table>";
  container.innerHTML = html;
  $("patientListModal").style.display = "block";
}

// ===== XÓA HỒ SƠ KHÁM =====
function deleteSingleRecord(appointmentId){
  if(!confirm("Bạn có chắc chắn muốn xóa hồ sơ khám này không?")) return;
  let appointments = loadData("appointments") || [];
  const record = appointments.find(a => a.appointmentId === appointmentId);
  if(!record){ alert("Không tìm thấy hồ sơ này!"); return; }
  appointments = appointments.filter(a => a.appointmentId !== appointmentId);
  saveData("appointments", appointments);
  alert(`Đã xóa hồ sơ khám của ${record.name} (${record.phone}) ngày ${record.date}.`);
  showPatientsList();
}

// ===== NÚT VỀ TRANG CHỦ =====
function goHome(){location.href="index.html";}
