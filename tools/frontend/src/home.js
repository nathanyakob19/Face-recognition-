import React, { Component } from 'react';

export default class Home extends Component {
    render() {
        return (
            <>

 <div className='NORMAL-TEXT'>Welcome...</div>                <br />
                <div>
                    <h3 className="details">Introduction of the web-app</h3>
                    <div className="details">
                    This internship project focuses on developing a real-time facial
recognition system for secure and contactless user authentication. The
application is built using Python and leverages the face_recognition
library, which encodes facial features into unique 128-dimensional
vectors for accurate identity matching. OpenCV is used to capture
images from a webcam, while Flask is employed to create RESTful
API endpoints for registration and login. A MySQL database stores
user information and facial encodings, and a React-based frontend
interfaces with the backend. During registration, the system captures a
user's face, computes the encoding, and stores it alongside personal
details such as name, department, and region. For authentication, a
new face image is captured and compared against stored encodings
using Euclidean distance. If a match is found, the user is granted
access, and their information is displayed. This project demonstrates
the integration of computer vision with full-stack web development
and provides hands-on experience with database management, API
design, and biometric verification technologies. It highlights the
practical use of facial recognition for applications like attendance
tracking and secure access systems.
                        This web application is made for the purpose of face recognition login using ReactJS as a frontend and Python Flask as a backend. Hence make sure that you have reactjs as well as python flask configured on your machine in order to run this application.
                    </div>
                    
                </div>
                
                <br />
                <div>
                    <h3 className="details">Registration Process</h3>
                    <div className="details">
                        <ol>
                            <li>
                                First of all navigate to the register section from navbar of this page.
                            </li>
                            <li>
                                Start your python flask server.
                            </li>
                            <li>
                                Enter your name and click on the button which will take your image for the registration purpose which will help you log in to the system.
                            </li>
                            <li>
                                Registration is completed successfully.
                            </li>
                        </ol>
                    </div>
                </div>
                <br />
                <div>
                    <h3 className="details">Login Process</h3>
                    <div className="details">
                        <ol>
                            <li>
                                First of all navigate to the login section from navbar of this page.
                            </li>
                            <li>
                                Make sure that python server is started.
                            </li>
                            <li>
                                Click on the login button which will take your image for the login purpose and will allow you to enter into the system if you are authenticated user.
                            </li>
                        </ol>
                    </div>
                </div>
            </>
        )
    }
}
