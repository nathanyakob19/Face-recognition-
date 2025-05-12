import React from 'react';
import Card from './components/card'; // Adjust path based on location

export default function HowItWorks() {
  const steps = [
    {
      title: "Step 1: Register",
      description: "Capture your face and enter your details. Your face encoding is stored securely.",
    },
    {
      title: "Step 2: Login",
      description: "Look at the webcam. The system matches your face with the stored encoding.",
    },
    {
      title: "Step 3: Access Granted",
      description: "If matched, you are logged in securely without needing a password.",
    },
  ];

  return (
    <section className="p-6 bg-black text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <Card key={index} title={step.title}>
            <p>{step.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
