// UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

const UserContextprovider = ({ children }) => {
    const [selectedUserName, setselectedUserName] = useState('noUser');

    const getUserName = (buttonName) => {
        setselectedUserName(buttonName);
    };

    const setUserName = (kantonName) => {
        selectedUserName(kantonName);
    };

    return (
        <UserContext.Provider value={{ selectedUserName, getUserName, setUserName }}>
            {children}
        </UserContext.Provider>
    );
};

const useUserContext = () => {
    return useContext(UserContext);
};

export { UserContextprovider, useUserContext };
