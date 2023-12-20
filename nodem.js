const nodemailer= require("nodemailer");
  const googleapis= require("googleapis");

  const REDIRECT_URI ='https://developers.google.com/oauthplayground';
  const CLIENT_ID ='217327769183-oueqfa28kg152el86vpkofjkkaokhi4v.apps.googleusercontent.com';
  const CLIENT_SECRET= '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';
  const REFRESH_TOKEN= '1//04SSeDN2sD9e7CgYIARAAGAQSNwF-L9IrcERfLNdpszvGoiykFBrTksx5cZuI6hSbeVr-RIAE8NaG8i8YHfftYIxY4S_kbl03NMY';

  const authClient= new googleapis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  authClient.setCredentials({refresh_token: REFRESH_TOKEN});

  async function mailer(receiver,id,key){
    try{
        const ACCESS_TOKEN = await authClient.getAccessToken();

        const transport = nodemailer.createTransport({
            service:"gmail",
            auth:{
                type: "OAuth2",
                user: "poornimagangwani@gmail.com",
                clientId: CLIENT_ID,
                clientSecret :CLIENT_SECRET,
                refreshToken :REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN
            }
        })
        const details ={
            from:"Poornima Gangwani <poornimagangwani@gmail.com>",
            to: receiver,
            subject:"hii ",
            text:"message text", 
           html:`You can recover your account using following link <a href="http://localhost:3000/forgot/${id}/${key}">http://localhost:3000/forgot/${id}/${key}</a>`
        }
        const result = await transport.sendMail(details);
        return result;
    }
    catch(err){
     return err;
    }
  }

module.exports = mailer;