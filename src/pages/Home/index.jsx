import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const goToCustomersList = () => {
    navigate("/customers");
  };

  return (
    <div>
      <h1>Bem-vindo ao Gerenciador de Oficina</h1>
      <button onClick={goToCustomersList}>Listagem de Clientes</button>
    </div>
  );
};

export default Home;
