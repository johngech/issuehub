import express from "express";

const PORT = process.env.PORT || 4000;

const app = express();

app.get("/api/health", (_req, res) => {
	res.send({
		status: "OK!",
	});
});

app.listen(PORT, () => {
	console.log(`The app is running @ http://localhost:${PORT}`);
});
