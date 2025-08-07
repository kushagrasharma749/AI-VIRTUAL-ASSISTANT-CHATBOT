document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input .send-btn");
    const inputInitHeight = chatInput.scrollHeight;

    let userMessage = null; // Variable to store user's message
    const API_KEY = "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"; // Paste your API key here

    const createChatLi = (message, className) => {
        // Create a chat <li> element with passed message and className
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", `${className}`);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi; // return chat <li> element
    };

    const generateResponse = (chatElement) => {
        const API_URL = "https://api.openai.com/v1/chat/completions";
        const messageElement = chatElement.querySelector("p");

        // Define the properties and message for the API request
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
            })
        };

        // Send POST request to API, get response and set the response as paragraph text
        fetch(API_URL, requestOptions)
            .then(res => res.json())
            .then(data => {
                const assistantResponse = data.choices[0].message.content.trim();
                messageElement.textContent = assistantResponse;

                // Repeat the question and the answer
                chatbox.appendChild(createChatLi(userMessage, "outgoing")); // repeat the user's message
                chatbox.appendChild(createChatLi(assistantResponse, "incoming")); // repeat the assistant's response

                // Speak the assistant's response
                speakMessage(assistantResponse);
            })
            .catch((err) => {
                console.error("Error:", err);
                messageElement.classList.add("error");
                messageElement.textContent = "Oops! Something went wrong. Please try again.";
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    };

    const speakMessage = (message) => {
        // Create a SpeechSynthesisUtterance object to speak the message
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = "en-US"; // Set the language to English
        window.speechSynthesis.speak(speech); // Speak the message
    };

    const handleChat = () => {
        userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
        if (!userMessage) return;

        // Append the user's message to the chatbox
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // Clear the input textarea and set its height to default
        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        setTimeout(() => {
            // Display "Thinking..." message while waiting for the response
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    };

    // Adjust the height of the input textarea based on its content
    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    // Send message on Enter key press (without Shift key)
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    // Send message on send button click
    sendChatBtn.addEventListener("click", handleChat);

    // Close the chatbot when close button is clicked
    closeBtn.addEventListener("click", () => {
        document.body.classList.remove("show-chatbot"); // Hide chatbot
    });

    // Toggle chatbot visibility when the chatbot toggler is clicked
    chatbotToggler.addEventListener("click", () => {
        document.body.classList.toggle("show-chatbot"); // Show/hide chatbot
    });

    // Function to handle voice recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error("Voice recognition error", event);
    };

    // Voice button logic to start listening
    document.querySelector(".voice-btn").addEventListener("click", () => {
        recognition.start();
    });
});
