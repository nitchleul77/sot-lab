// ========== GROQ CONFIGURATION ==========
// 🔑 REPLACE WITH YOUR GROQ API KEY (if needed)
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.1-8b-instant"; // Fast, free model

// PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("🧠 SOT MindGuard AI - Ready (Groq)");

  // ========== PARTICLES ==========
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 40, density: { enable: true, value_area: 500 } },
        color: { value: '#a855f7' },
        shape: { type: 'circle' },
        opacity: { value: 0.4 },
        size: { value: 2, random: true },
        move: { enable: true, speed: 1 }
      },
      interactivity: { events: { onhover: { enable: false } } }
    });
  }

  // ========== STUDY PROGRESS (localStorage) ==========
  let studySessions = JSON.parse(localStorage.getItem('mindguard_sessions')) || {};
  let studyStreak = parseInt(localStorage.getItem('mindguard_streak')) || 0;

  function saveSessions() {
    localStorage.setItem('mindguard_sessions', JSON.stringify(studySessions));
  }

  function updateStreakAndUI() {
    let streak = 0;
    let currentDate = new Date();
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (studySessions[dateStr] && studySessions[dateStr] > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    studyStreak = streak;
    localStorage.setItem('mindguard_streak', studyStreak);
    
    const streakEl = document.getElementById("streak");
    const miniStreakEl = document.getElementById("miniStreak");
    if (streakEl) streakEl.innerText = studyStreak;
    if (miniStreakEl) miniStreakEl.innerText = studyStreak;
    
    updateProgressUI();
  }

  function addStudySession(minutes) {
    const today = new Date().toISOString().split('T')[0];
    studySessions[today] = (studySessions[today] || 0) + minutes;
    saveSessions();
    updateStreakAndUI();
  }

  function updateProgressUI() {
    let totalMinutes = 0;
    for (let date in studySessions) totalMinutes += studySessions[date];
    const totalHours = (totalMinutes / 60).toFixed(1);
    const totalHoursEl = document.getElementById("totalHours");
    if (totalHoursEl) totalHoursEl.innerText = totalHours;
    
    const currentStreakEl = document.getElementById("currentStreak");
    if (currentStreakEl) currentStreakEl.innerText = studyStreak;
    
    let last7Minutes = [];
    for (let i = 6; i >= 0; i--) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      let dateStr = date.toISOString().split('T')[0];
      last7Minutes.push(studySessions[dateStr] || 0);
    }
    const avgDaily = Math.round(last7Minutes.reduce((a,b) => a+b, 0) / 7);
    const avgDailyEl = document.getElementById("avgDaily");
    if (avgDailyEl) avgDailyEl.innerText = avgDaily;
    
    const chartContainer = document.getElementById("chartBars");
    if (chartContainer) {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      let html = '';
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const minutes = studySessions[dateStr] || 0;
        const height = Math.min(100, (minutes / 60) * 100);
        html += `
          <div class="chart-bar-container">
            <div class="chart-value">${minutes}min</div>
            <div class="chart-bar" style="height: ${height}px;"></div>
            <div class="chart-label">${dayNames[i]}</div>
          </div>
        `;
      }
      chartContainer.innerHTML = html;
    }
    
    const insightMessage = document.getElementById("insightMessage");
    if (insightMessage) {
      if (studyStreak > 0) {
        insightMessage.innerHTML = `🔥 You're on a ${studyStreak} day study streak! Keep going! ${totalHours} total hours studied. ${studyStreak >= 7 ? "Amazing consistency! 🎉" : "You're building great habits!"}`;
      } else {
        insightMessage.innerHTML = `📚 Start a study session today to begin your streak! Complete 25 minutes to earn your first day.`;
      }
    }
  }

  // ========== MAIN TIMER ==========
  let mainTimer = null, mainSeconds = 1500, mainTotalSeconds = 1500;
  function updateMainDisplay() {
    const timeElement = document.getElementById("time");
    if (timeElement) {
      const min = Math.floor(mainSeconds / 60);
      const sec = mainSeconds % 60;
      timeElement.innerText = `${min}:${sec < 10 ? "0" : ""}${sec}`;
    }
    const progress = document.getElementById("progressBar");
    if (progress && mainTotalSeconds > 0) {
      const percent = ((mainTotalSeconds - mainSeconds) / mainTotalSeconds) * 100;
      progress.style.width = percent + "%";
    }
  }
  function setMainTime() {
    const input = document.getElementById("minutesInput");
    if (input) {
      const minutes = parseInt(input.value);
      if (minutes && minutes > 0) {
        mainSeconds = minutes * 60;
        mainTotalSeconds = mainSeconds;
        updateMainDisplay();
      }
    }
  }
  function startMainTimer() {
    if (mainTimer) return;
    mainTimer = setInterval(() => {
      if (mainSeconds > 0) {
        mainSeconds--;
        updateMainDisplay();
      } else {
        clearInterval(mainTimer);
        mainTimer = null;
        alert("🎉 Study session complete! +25 minutes added.");
        addStudySession(25);
      }
    }, 1000);
  }
  function pauseMainTimer() { clearInterval(mainTimer); mainTimer = null; }
  function resetMainTimer() {
    clearInterval(mainTimer);
    mainTimer = null;
    const input = document.getElementById("minutesInput");
    const minutes = input ? parseInt(input.value) : 25;
    mainSeconds = minutes * 60;
    mainTotalSeconds = mainSeconds;
    updateMainDisplay();
  }
  document.getElementById("setTimeBtn")?.addEventListener("click", setMainTime);
  document.getElementById("startTimerBtn")?.addEventListener("click", startMainTimer);
  document.getElementById("pauseTimerBtn")?.addEventListener("click", pauseMainTimer);
  document.getElementById("resetTimerBtn")?.addEventListener("click", resetMainTimer);
  updateMainDisplay();

  // ========== MINI TIMER ==========
  let miniTimer = null, miniSeconds = 1500, miniTotalSeconds = 1500;
  function updateMiniDisplay() {
    const timeElement = document.getElementById("miniTime");
    if (timeElement) {
      const min = Math.floor(miniSeconds / 60);
      const sec = miniSeconds % 60;
      timeElement.innerText = `${min}:${sec < 10 ? "0" : ""}${sec}`;
    }
  }
  function setMiniTime() {
    const input = document.getElementById("miniMinutesInput");
    if (input) {
      const minutes = parseInt(input.value);
      if (minutes && minutes > 0) {
        miniSeconds = minutes * 60;
        miniTotalSeconds = miniSeconds;
        updateMiniDisplay();
      }
    }
  }
  function startMiniTimer() {
    if (miniTimer) return;
    miniTimer = setInterval(() => {
      if (miniSeconds > 0) {
        miniSeconds--;
        updateMiniDisplay();
      } else {
        clearInterval(miniTimer);
        miniTimer = null;
        alert("🎉 Study session complete! +25 minutes added.");
        addStudySession(25);
      }
    }, 1000);
  }
  function pauseMiniTimer() { clearInterval(miniTimer); miniTimer = null; }
  function resetMiniTimer() {
    clearInterval(miniTimer);
    miniTimer = null;
    const input = document.getElementById("miniMinutesInput");
    const minutes = input ? parseInt(input.value) : 25;
    miniSeconds = minutes * 60;
    miniTotalSeconds = miniSeconds;
    updateMiniDisplay();
  }
  document.getElementById("miniSetBtn")?.addEventListener("click", setMiniTime);
  document.getElementById("miniStartBtn")?.addEventListener("click", startMiniTimer);
  document.getElementById("miniPauseBtn")?.addEventListener("click", pauseMiniTimer);
  document.getElementById("miniResetBtn")?.addEventListener("click", resetMiniTimer);
  updateMiniDisplay();

  // ========== STREAK BUTTONS ==========
  function manualStreakAdd() {
    const today = new Date().toISOString().split('T')[0];
    if (!studySessions[today]) {
      addStudySession(30);
      alert("✅ +30 minutes recorded for today!");
    } else {
      alert("You already recorded a session today!");
    }
  }
  document.getElementById("streakBtn")?.addEventListener("click", manualStreakAdd);
  document.getElementById("miniStreakBtn")?.addEventListener("click", manualStreakAdd);

  updateStreakAndUI();

  // ========== PDF TEXT EXTRACTION ==========
  async function extractPdfText(file) {
    if (typeof pdfjsLib === 'undefined') {
      return "PDF.js library not loaded. Cannot extract text.";
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText.slice(0, 3000);
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '[Error extracting PDF text]';
    }
  }

  // ========== AI CHAT (Groq) ==========
  let isSending = false;
  let chatHistory = [];

  async function sendMessage() {
    if (isSending) return;
    
    const sendButton = document.getElementById("sendButton");
    const input = document.getElementById("userInput");
    const fileInput = document.getElementById("pdfFile");
    const chat = document.getElementById("chatBox");

    if (!sendButton || !input || !chat) {
      console.error("Required elements missing");
      return;
    }

    const message = input.value.trim();

    if (message === "" && (!fileInput || fileInput.files.length === 0)) {
      alert("Type a message or upload a PDF.");
      return;
    }

    isSending = true;
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>';

    // Add user message
    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    if (message) {
      userMsg.innerText = message;
    } else if (fileInput && fileInput.files.length > 0) {
      userMsg.innerText = "📄 " + fileInput.files[0].name;
    }
    chat.appendChild(userMsg);

    // Typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot";
    const typingText = document.createElement("span");
    typingText.innerText = "MindGuard AI is thinking";
    const dotContainer = document.createElement("span");
    dotContainer.style.display = "inline-block";
    dotContainer.style.minWidth = "24px";
    dotContainer.style.textAlign = "left";
    typingDiv.appendChild(typingText);
    typingDiv.appendChild(dotContainer);
    chat.appendChild(typingDiv);
    chat.scrollTop = chat.scrollHeight;
    
    let dots = 0;
    const typingAnimation = setInterval(() => {
      dots = (dots + 1) % 4;
      dotContainer.innerText = ".".repeat(dots);
    }, 400);

    try {
      let prompt = message;
      let pdfText = null;
      
      if (fileInput && fileInput.files.length > 0) {
        pdfText = await extractPdfText(fileInput.files[0]);
        prompt = `[Document content]:\n${pdfText}\n\nBased on the document, answer: ${message || "Please summarize this document."}`;
      }
      
      // Build conversation context (last 5 exchanges)
      const messages = [
        { role: 'system', content: 'You are SOT MindGuard AI, a helpful study assistant. Provide accurate, clear, and educational answers.' }
      ];
      for (let i = Math.max(0, chatHistory.length - 5); i < chatHistory.length; i++) {
        messages.push(chatHistory[i]);
      }
      messages.push({ role: 'user', content: prompt });
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      const data = await response.json();
      console.log("Groq response:", data);
      
      let aiReply = "Sorry, I couldn't generate a response.";
      if (data.error) {
        console.error("Groq error:", data.error);
        aiReply = `⚠️ API Error: ${data.error.message || JSON.stringify(data.error)}`;
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        aiReply = data.choices[0].message.content;
      } else {
        aiReply = "⚠️ Unexpected response from Groq. Please try again.";
      }
      
      clearInterval(typingAnimation);
      typingDiv.remove();
      
      const botMsg = document.createElement("div");
      botMsg.className = "message bot";
      botMsg.innerHTML = `<i class="fas fa-robot"></i> ${aiReply}`;
      chat.appendChild(botMsg);
      chat.scrollTop = chat.scrollHeight;
      
      // Update chat history
      if (!data.error) {
        chatHistory.push({ role: 'user', content: message || `[Document analysis request]` });
        chatHistory.push({ role: 'assistant', content: aiReply });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      }
      
    } catch (error) {
      console.error("Chat fetch error:", error);
      clearInterval(typingAnimation);
      typingDiv.innerHTML = `⚠️ Network error: ${error.message}. Check your internet connection.`;
      setTimeout(() => {
        if (typingDiv && typingDiv.parentNode) typingDiv.remove();
      }, 4000);
    }

    sendButton.disabled = false;
    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
    input.value = "";
    if (fileInput) fileInput.value = "";
    chat.scrollTop = chat.scrollHeight;
    isSending = false;
  }

  const sendBtn = document.getElementById("sendButton");
  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
    console.log("✅ Send button listener attached");
  } else {
    console.error("❌ Send button not found!");
  }

  const inputField = document.getElementById("userInput");
  if (inputField) {
    inputField.addEventListener("keypress", function(e) {
      if (e.key === "Enter" && !isSending) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ========== NAVIGATION & MODALS (optional) ==========
  const navChat = document.getElementById('navChat');
  const navStudyTools = document.getElementById('navStudyTools');
  const navDocuments = document.getElementById('navDocuments');
  const navHelp = document.getElementById('navHelp');
  const mainChat = document.getElementById('mainChat');
  const studyToolsPanel = document.getElementById('studyToolsPanel');
  const helpModal = document.getElementById('helpModal');
  const documentsModal = document.getElementById('documentsModal');
  const closeModalBtns = document.querySelectorAll('.close-modal');

  if (navChat) navChat.addEventListener('click', (e) => { e.preventDefault(); if(mainChat) mainChat.style.display = 'flex'; if(studyToolsPanel) studyToolsPanel.style.display = 'none'; });
  if (navStudyTools) navStudyTools.addEventListener('click', (e) => { e.preventDefault(); if(mainChat) mainChat.style.display = 'none'; if(studyToolsPanel) studyToolsPanel.style.display = 'block'; });
  if (navHelp && helpModal) navHelp.addEventListener('click', (e) => { e.preventDefault(); helpModal.style.display = 'flex'; });
  if (navDocuments && documentsModal) navDocuments.addEventListener('click', (e) => { e.preventDefault(); loadDocumentsList(); documentsModal.style.display = 'flex'; });
  closeModalBtns.forEach(btn => btn.onclick = () => { if(helpModal) helpModal.style.display = 'none'; if(documentsModal) documentsModal.style.display = 'none'; });
  window.onclick = (e) => { if(e.target === helpModal) helpModal.style.display = 'none'; if(e.target === documentsModal) documentsModal.style.display = 'none'; };

  // ========== DOCUMENTS MANAGEMENT ==========
  let studyDocs = JSON.parse(localStorage.getItem('study_documents')) || [];

  function loadDocumentsList() {
    const container = document.getElementById('documentsList');
    if (!container) return;
    if (studyDocs.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:20px;">No documents yet. Teachers can upload study materials.</div>';
      return;
    }
    container.innerHTML = studyDocs.map(doc => `
      <div class="doc-card">
        <h4><i class="fas fa-file-alt"></i> ${escapeHtml(doc.title)}</h4>
        <p>${escapeHtml(doc.description || 'No description')}</p>
        <a href="${doc.link}" target="_blank">Open Resource →</a>
        <small style="display:block; margin-top:8px; color:#94a3b8;">Added: ${doc.date}</small>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  const showTeacherBtn = document.getElementById('showTeacherUpload');
  const teacherArea = document.getElementById('teacherUploadArea');
  if (showTeacherBtn) {
    showTeacherBtn.addEventListener('click', () => {
      if (teacherArea) teacherArea.style.display = teacherArea.style.display === 'none' ? 'block' : 'none';
    });
  }

  const uploadDocBtn = document.getElementById('uploadDocBtn');
  if (uploadDocBtn) {
    uploadDocBtn.addEventListener('click', () => {
      const key = document.getElementById('teacherKey')?.value;
      if (key !== 'TEACHER2026') {
        alert('Invalid teacher key. Use TEACHER2026');
        return;
      }
      const title = document.getElementById('docTitle')?.value.trim();
      const link = document.getElementById('docLink')?.value.trim();
      const desc = document.getElementById('docDesc')?.value.trim();
      if (!title || !link) {
        alert('Please fill title and link');
        return;
      }
      studyDocs.unshift({
        id: Date.now(),
        title: title,
        link: link,
        description: desc,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem('study_documents', JSON.stringify(studyDocs));
      alert('Document uploaded!');
      if (document.getElementById('docTitle')) document.getElementById('docTitle').value = '';
      if (document.getElementById('docLink')) document.getElementById('docLink').value = '';
      if (document.getElementById('docDesc')) document.getElementById('docDesc').value = '';
      if (document.getElementById('teacherKey')) document.getElementById('teacherKey').value = '';
      if (teacherArea) teacherArea.style.display = 'none';
      loadDocumentsList();
    });
  }

  loadDocumentsList();

  console.log("✅ SOT MindGuard AI - Ready (Groq)");
});