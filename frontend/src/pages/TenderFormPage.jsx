// src/pages/TenderFormPage.jsx
import React from 'react';
import Header from '../components/Header';
import TenderForm from '../components/TenderForm'; // wcześniej utworzony formularz


const TenderFormPage = () => {
    return (
        <div>
            <Header />
            <TenderForm />
        </div>
    );
};

export default TenderFormPage;
