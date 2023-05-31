import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import styles from '@/styles/ExpForm.module.css'

const ExperienceForm = () => {
    const { getToken, user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [geolocation, setGeolocation] = useState([0, 0]);
    const [keywords, setKeywords] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [inputKey, setInputKey] = useState(Date.now());
    const [isImageSelected, setIsImageSelected] = useState(false);
    const storage = getStorage();


    const handleSubmit = (event) => {
        event.preventDefault();
        try {
            if (!user) {
                console.error('No current user');
                return;
            }
            // Uploading an image to firebase
            // Code Citation: https://firebase.google.com/docs/storage/web/upload-files
            if (image) {
                // Create the file metadata
                /** @type {any} */
                const metadata = {
                  contentType: 'image/jpeg'
                };

                // Upload file and metadata to the object 'images/mountains.jpg'
                const storageRef = ref(storage, 'images/' + image.name);
                const uploadTask = uploadBytesResumable(storageRef, image, metadata);

                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on('state_changed',
                  (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                      case 'paused':
                        console.log('Upload is paused');
                        break;
                      case 'running':
                        console.log('Upload is running');
                        break;
                    }
                  }, 
                  (error) => {
                    switch (error.code) {
                      case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                      case 'storage/canceled':
                        // User canceled the upload
                        break;
                      case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                    }
                  }, 
                  async () => {

                    if (user) {
                        // User is signed in.
                        const token = await getToken();  // Fetches a new token.

                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            console.log('File available at', downloadURL);

                            const formData = new FormData();
                            formData.append('title', title);
                            formData.append('img_url', downloadURL);
                            formData.append('description', description);
                            formData.append('geolocation', geolocation.map(parseFloat).join(','));
                            formData.append('keywords', keywords);
                            
                            submitData(formData, token)  // Pass the new token to the submitData function
                        });
                    } else {
                        // No user is signed in.
                        console.log("No user is signed in");
                    }
                  }
                );
            }

            const submitData = async (formData, token) => {
                console.log(formData.get('img_url'), 'IMG URL');
                console.log(token, 'TOKEN submitdata')
                const response = await fetch('https://travel-planner-production.up.railway.app/experience/addNewExperience', {
                    // const response = await fetch('http://localhost:5001/experience/addNewExperience', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData
                });


                const data = await response.json();
                console.log('New experience added with ID:', data.experience_id);
                if (data.experience_id != undefined){
                    window.location.href = `/experience/${data.experience_id}`;
                }
            };

            // submitData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
        setImagePreview(URL.createObjectURL(event.target.files[0])); 
        setIsImageSelected(true);
    }

    const handleClear = () => {
        setTitle('');
        setDescription('');
        setGeolocation([0, 0]);
        setKeywords('');
        setImage(null);
        setImagePreview(null);
        setInputKey(Date.now());
    };

    const adjust_textarea = (h) => {
        h.target.style.height = "20px";
        h.target.style.height = (h.target.scrollHeight)+"px";
    }
    

    return (

        <div>{!user ? (
            <h1>Please Log In</h1>
        ) : (<>
            <h2 className={styles.title}>Create New Experience</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.container}>
                    <div className={styles.leftFormContent}>
                        <label>
                            Image:
                        </label>
                        <input id="file-upload" key={inputKey} type="file" accept="image/*" onChange={handleImageChange} required/>
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: "100px", height: "100px" }} />}
                    </div>
                    <div className={styles.rightFormContent}>
                        <ul>
                            <li>
                                <label>Experience Title:</label>
                                <input type="text" value={title} required onChange={(event) => setTitle(event.target.value)} />
                                <span>Enter the experience title</span>
                            </li>
                            <li>
                                <label>Description:</label>
                                <textarea value={description} required onChange={(event) => setDescription(event.target.value)} onKeyUp={adjust_textarea}></textarea>
                                <span>Enter a description</span>
                            </li>
                            <li className={styles.coordinates}>
                                <label>Geolocation:</label>
                                <div>
                                    <span>(</span>
                                    <input type="number" value={geolocation[0] || ""} placeholder='Latitude' required onChange={(event) => setGeolocation([event.target.value, geolocation[1]])} />
                                    <span>)</span>
                                    <span>,</span>
                                    <span>(</span>
                                    <input type="number" value={geolocation[1] || ""} placeholder='Longitude' required onChange={(event) => setGeolocation([geolocation[0], event.target.value])} />
                                    <span>)</span>
                                </div>
                                <span>Enter the coordinates</span>
                            </li>
                            <li>
                                <label>Keywords:</label>
                                <input type="text" value={keywords} required onChange={(event) => setKeywords(event.target.value)} />
                                <span>Enter keywords (separate with comma)</span>
                            </li>
                            <li>
                                <input type="submit" value="Submit" />
                                <input type="button" value="Clear" onClick={handleClear} />
                                <input type="button" value="Cancel" onClick={() => window.history.back()} />
                            </li>
                        </ul>
                    </div>
                </div>
            </form>
        </>)}
        </div>
    );
};

export default ExperienceForm;
