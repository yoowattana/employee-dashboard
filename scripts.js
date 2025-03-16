const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydiAQywLLeVSJpQbzw99aPlwd5Y4qkkeGbCX0gaqMerDnRGNC6vN6O8sPJbaN7ym-S/exec';

function checkLogin() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    window.location.href = 'login.html';
  }
  return loggedInUser;
}

function navigateTo(page) {
  window.location.href = page;
}

function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน!');
    return;
  }

  const data = { action: 'login', username, password };
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors', // ระบุว่าเป็นคำขอแบบ CORS
    redirect: 'follow'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem('loggedInUser', JSON.stringify({ username, role: data.role }));
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message);
    }
  })
  .catch(error => alert('เกิดข้อผิดพลาด: ' + error.message));
}

function getLocationAndCheck(action) {
  const loggedInUser = checkLogin();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const data = {
        action: action,
        username: loggedInUser.username,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      sendCheckInOut(data);
    }, (error) => {
      console.error('Geolocation error:', error);
      const site = document.getElementById('siteSelect').value;
      if (confirm('ไม่สามารถดึงตำแหน่งได้ คุณต้องการใช้ไซต์ที่เลือก (' + site + ') หรือไม่?')) {
        const siteData = {
          action: action,
          username: loggedInUser.username,
          latitude: 0,
          longitude: 0,
          site: site
        };
        sendCheckInOut(siteData);
      } else {
        alert('กรุณาเปิดใช้งาน GPS หรือเลือกไซต์งาน');
      }
    });
  } else {
    alert('เบราว์เซอร์นี้ไม่รองรับ Geolocation');
  }
}

function sendCheckInOut(data) {
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'cors',
    redirect: 'follow'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    alert(data.message);
  })
  .catch(error => alert('เกิดข้อผิดพลาด: ' + error.message));
}

function submitLeave() {
  const loggedInUser = checkLogin();
  const data = {
    action: 'submitLeave',
    username: loggedInUser.username,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    leaveType: document.getElementById('leaveType').value,
    reason: document.getElementById('reason').value
  };
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'cors',
    redirect: 'follow'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    alert(data.message);
    if (data.success) fetchData('leave');
  })
  .catch(error => alert('เกิดข้อผิดพลาด: ' + error.message));
}

function submitOT() {
  const loggedInUser = checkLogin();
  const data = {
    action: 'submitOT',
    username: loggedInUser.username,
    date: document.getElementById('otDate').value,
    startTime: document.getElementById('otStartTime').value,
    endTime: document.getElementById('otEndTime').value,
    reason: document.getElementById('otReason').value
  };
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'cors',
    redirect: 'follow'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    alert(data.message);
  })
  .catch(error => alert('เกิดข้อผิดพลาด: ' + error.message));
}

function fetchData(type) {
  const loggedInUser = checkLogin();
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getData', type: type, username: loggedInUser.username }),
    mode: 'cors',
    redirect: 'follow'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      const table = document.getElementById(type === 'checkin' ? 'workHistoryTable' : type === 'leave' ? 'leaveTable' : 'salaryTable');
      table.innerHTML = '<tr>' + data.data[0].map(col => `<th>${col}</th>`).join('') + '</tr>' +
        data.data.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
    }
  })
  .catch(error => alert('เกิดข้อผิดพลาด: ' + error.message));
}