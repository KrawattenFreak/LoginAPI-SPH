const superagent = require('superagent');

const express = require('express');
const app = express();
const port = 3000; // Port, auf dem der Server laufen wird

app.use(express.json())

app.post('/authentication', (req, res) => {

    const { username, password } = req.body;

    console.log('Anfrage mit USERNAME: ' + username)
    //-------------------------------------------------------

    let authenticationData = {
        sessionID: null,
        SPHSession: null
    }

    superagent
        .post('https://login.schulportal.hessen.de/?i=5220')
        .send({
            'time-honoured': '2',
            skin: 'sp',
            user2: username,
            user: '5220.' + username,
            password: password
        })
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .redirects(0)
        .withCredentials(false)
        .end((err1, res1) => {
            const SPHSession = res1.headers['set-cookie'][0].split(';')[0].slice(12);
            const url2 = res1.headers.location



            if (url2) {
                superagent
                    .get(url2)
                    .set('Cookie', 'SPH-Session=' + SPHSession)
                    .redirects(0)
                    .withCredentials(false)
                    .end((err2, res2) => {
                        const url3 = res2.headers.location


                        superagent
                            .get(url3)
                            .set('Cookie', 'SPH-Session=' + SPHSession)
                            .redirects(0)
                            .withCredentials(false)
                            .end((err3, res3) => {

                                const sid = res3.headers['set-cookie'][2].split(';')[0].slice(-26)

                                authenticationData.sessionID = sid
                                authenticationData.SPHSession = SPHSession


                                res.json({ authenticationData: authenticationData });

                            })
                    })

            } else {

                res.sendStatus(401)

            }



        });

    //-------------------------------------------------------






});


app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});


