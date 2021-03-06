import { authService, dbService, storageService } from "fBase";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import './ProfileStyle.scss';

export default ({ refreshUser, userObj }) => {
    const history=useHistory();
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const [userPhotoURL, serUserPhotoURL] =useState(userObj.user);
    const [newPhotoURL, setNewPhotoURL] = useState("");


    const onLogOutClick =() => {
        authService.signOut(); 
        history.push("/");
    };
    const getMyTweets = async() =>{
        // π‘ filtering
        // π‘ μΏΌλ¦¬ μμ±μ νλ €λ©΄ νμ΄μ΄λ² μ΄μ€μ κ°μ μμΈμμ±μ ν΄μ€μΌν¨..
        const tweets = await dbService
        .collection("tweets")
        .where("createrId", "==", userObj.uid)
        .orderBy("createdAt")
        .get();
       
    }
    useEffect(()=>{
        getMyTweets();
    },[]);

    const onSubmit = async (event) => {
        event.preventDefault();
        if(userObj.displayName !== newDisplayName){
            await userObj.updateProfile({
                displayName: newDisplayName
            });
            refreshUser();
            alert("π success !");
        }else if(userObj.displayName==''){
            alert("β write your name !")
        }else{
            alert("β same name !")
        }

    }

    const onSubmitURL = async (event) => {
        event.preventDefault();
        let attachmentUrl = "";
        if(userPhotoURL !== ""){
            // 1. νμΌμ λν λ νΌλ°μ€λ₯Ό λ§λ λ€.
            const attachmentRef=storageService.ref().child(`${userObj.uid}/${uuidv4()}`);

            // 2. νμΌ λ°μ΄ν°λ₯Ό λ νΌλ°μ€λ‘ λ³΄λΈλ€.
            const response= await attachmentRef.putString(userPhotoURL, "data_url");

            // 3. λ€μ΄λ‘λ url
            attachmentUrl= await response.ref.getDownloadURL();

            userObj.updateProfile({
                photoURL: attachmentUrl
              }).then(() => {
                console.log("μ μ μ  νλ‘ν "+userObj.photoURL);
                alert("π success !");
              }).catch((error) => {
                console.log("μ url "+attachmentUrl);
              });  

        }
    }
    const onChange = (event) => {
        const { target : {value} } = event;
        setNewDisplayName(value);
    }
    const onFileChange = (event) =>{
        const {target : {files}}=event;
        const theFile=files[0];
        const reader =  new FileReader();
        reader.onloadend= (finishedEvent) => {
            const { currentTarget : { result }} = finishedEvent;
            serUserPhotoURL(result);
            console.log("λ°λ νμΌ: ", userPhotoURL);
        };
        reader.readAsDataURL(theFile);
    }
    const onClearAttachmentClick = () => {
        serUserPhotoURL(null);
        document.getElementById("imgSrc").value="";
    }
    return (
        <>
        <div className="profileEdit">

            <form onSubmit={onSubmit} className="profile">
                <div>
                <input type="file" accept="image/*" id="imgSrc" onChange = {onFileChange}/>
                
                {userPhotoURL && (
                    <div className="photoInfo">
                        <div><img src = {userPhotoURL} width = "100px" height ="100px" /></div>
                        <div><button className="photoBtn" onClick={onClearAttachmentClick} >Clear</button></div>
                    </div>
                )}
                 <button  onClick ={ onSubmitURL }>OK</button>
                </div>
                <div>
                    <input onChange={onChange} type="text" placeholder={newDisplayName} />
                    <button type="submit">Update Profile</button>
                </div>
               
            </form>
                 <button onClick={onLogOutClick} className="login">
                    Log out
                </button>
             
        </div>
        </>
    );
};