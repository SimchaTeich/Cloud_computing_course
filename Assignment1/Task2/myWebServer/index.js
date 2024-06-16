const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', async (req, res) => {
    try {
        const response = await fetch('http://localhost:3000/videoList');
        const videoList = await response.json();
        
        // Prepare HTML with the video list
        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>UTube</title>
            <style>
                .container {
                    display: flex;
                }
                table {
                    border-collapse: collapse;
                    width: 25%;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                .video-container {
                    flex: 1;
                }
                .video-player {
                    flex: 1;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="video-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Video List</th>
                            </tr>
                        </thead>
                        <tbody>`;

        videoList.forEach(video => {
            html += `<tr><td>${video}</td></tr>`
        });

        html += `       </tbody>
                    </table>
                </div>
                <div class="video-player" id="videoPlayer">`;
        // Prepare HTML with the video player here in Task3
        
        html +=`                </div>
            </div>
        </body>
        </html>`;

        res.send(html);
    } catch (error) {
        console.error('Error fetching video list:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
