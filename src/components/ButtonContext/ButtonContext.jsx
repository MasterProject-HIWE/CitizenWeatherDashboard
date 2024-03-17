// ButtonContext.js
import React, { createContext, useContext, useState } from 'react';

const ButtonContext = createContext();

const ButtonProvider = ({ children }) => {
    const [selectedButton, setSelectedButton] = useState('Total');

    const handleToggle = (buttonName) => {
        setSelectedButton(buttonName);
    };

    return (
        <ButtonContext.Provider value={{ selectedButton, handleToggle }}>
            {children}
        </ButtonContext.Provider>
    );
};

const useButtonContext = () => {
    return useContext(ButtonContext);
};

export { ButtonProvider, useButtonContext };
