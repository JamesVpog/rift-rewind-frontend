const form = document.getElementById('request-match-analysis');
const statusMessage = document.getElementById('status-message');

form.addEventListener('submit', async (e) => {
	e.preventDefault();

	const formData = new FormData(e.target);
	const data = Object.fromEntries(formData);

	// Show loading state
	statusMessage.textContent = "Fetching your match data...";
	statusMessage.style.backgroundColor = "#3b82f6"; // Blue for loading
	statusMessage.style.display = "block";

	try {
		console.log("Sending data:", data);

		const lambdaURL = "https://xacgllwbjirhyz3xi6wwvnpqz40olqhf.lambda-url.us-west-2.on.aws/";
		const response = await fetch(lambdaURL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		const responseText = await response.text();

		// Try to parse as JSON
		let result;
		try {
			result = JSON.parse(responseText);
		} catch (parseError) {
			throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
		}

		// Handle error responses (even if status is 200)
		if (!response.ok || result.error) {
			const errorMsg = result.error || result.message || `HTTP ${response.status}: ${response.statusText}`;
			statusMessage.textContent = errorMsg;
			statusMessage.style.backgroundColor = "#ef4444"; // Red
			console.error('Error from server:', result);
			return;
		}

		// Success!
		statusMessage.textContent = "Analysis complete!";
		statusMessage.style.backgroundColor = "#10b981"; // Green
		console.log('Success:', result);

		// Display result nicely (not as raw JSON)
		displayResult(result);

	} catch (error) {
		console.error('Fetch error:', error);

		// User-friendly error messages
		let errorMsg = "Something went wrong. ";
		if (error.message.includes('Failed to fetch')) {
			errorMsg += "Could not connect to server. Check your internet connection.";
		} else if (error.message.includes('invalid JSON')) {
			errorMsg += "Server returned an unexpected response.";
		} else {
			errorMsg += error.message;
		}

		statusMessage.textContent = errorMsg;
		statusMessage.style.backgroundColor = "#ef4444";
	}
});

// Helper function to display results nicely
function displayResult(result) {
	const resultDiv = document.getElementById('result');

	// If you're returning structured data, format it nicely
	// For now, pretty-print JSON
	resultDiv.textContent = JSON.stringify(result, null, 2);

	// Better: render it as HTML if you know the structure
	// resultDiv.innerHTML = `
	// 	<h3>Your Stats</h3>
	// 	<p>Games Played: ${result.gamesPlayed}</p>
	// 	<p>Win Rate: ${result.winRate}%</p>
	// `;
}
