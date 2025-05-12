import React from 'react';

const LibrariesUsed = () => {
  const libraries = [
    {
      name: "React",
      description: "Frontend JavaScript library for building user interfaces.",
      link: "https://reactjs.org/",
    },
    {
      name: "React Router DOM",
      description: "Handles client-side routing in React apps.",
      link: "https://reactrouter.com/",
    },
    {
      name: "Flask",
      description: "Python micro web framework used for backend and REST API.",
      link: "https://flask.palletsprojects.com/",
    },
    {
      name: "face_recognition",
      description: "Python library to recognize faces using deep learning.",
      link: "https://github.com/ageitgey/face_recognition",
    },
    {
      name: "OpenCV",
      description: "Open-source library for real-time computer vision.",
      link: "https://opencv.org/",
    },
    {
      name: "MySQL",
      description: "Relational database used to store user and face data.",
      link: "https://www.mysql.com/",
    },
    {
      name: "Bootstrap",
      description: "CSS framework for responsive design and layout.",
      link: "https://getbootstrap.com/",
    },
  ];

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">Libraries Used</h2>
      <ul className="space-y-4" typeof='none'>
        {libraries.map((lib, index) => (
          <li key={index} className="bg-gray-800 p-4 rounded-xl border border-gray-600">
            <h3 className="text-xl font-semibold">
              <a href={lib.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {lib.name}
              </a>
            </h3>
            <p className="text-gray-300">{lib.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LibrariesUsed;
