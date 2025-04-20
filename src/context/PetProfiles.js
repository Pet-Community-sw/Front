// PetContext.js
import { useViewProfile } from "../hooks/useProfile";
import { createContext, useContext } from "react";

//데이터 공간 생성 profiles, isLoading 등 담을 수 있음
const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const { data: petProfiles = [], isLoading } = useViewProfile();

  return (
    <PetContext.Provider value={{ petProfiles, isLoading }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePetContext = () => useContext(PetContext);
