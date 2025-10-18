import SudokuGame from "@/components/SudokuGame";
import UpdatePrompt from "@/components/UpdatePrompt";
import InstallPrompt from "@/components/InstallPrompt";

const Index = () => {
  return (
    <>
      <UpdatePrompt />
      <InstallPrompt />
      <SudokuGame />
    </>
  );
};

export default Index;
