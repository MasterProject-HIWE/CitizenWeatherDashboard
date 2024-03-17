// KantonContext.js
import React, { createContext, useContext, useState } from 'react';

const KantonContext = createContext();

const KantonContextProvider = ({ children }) => {
    const [selectedKantonName, setselectedKantonName] = useState(null);

    const getKantonName = (kantonName) => {
        setselectedKantonName(kantonName);
    };

    return (
        <KantonContext.Provider value={{ selectedKantonName, getKantonName }}>
            {children}
        </KantonContext.Provider>
    );
};

const useKantonContext = () => {
    return useContext(KantonContext);
};

export { KantonContextProvider, useKantonContext };
