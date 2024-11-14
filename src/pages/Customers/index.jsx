import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TablePagination,
  IconButton,
  TextField,
  Grid,
} from "@mui/material";
import { Visibility, Edit } from "@mui/icons-material"; // Importando os ícones
import api from "../../services/api";
import CustomerModal from "../../components/CustomerModal";
import Feedback from "../../components/Feedback";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de itens por página
  const [filters, setFilters] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // Estado para o cliente em edição
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    type: "",
  });

  // Função para buscar os clientes com os filtros aplicados
  async function fetchCustomers(page = 0, size = pageSize, filters = {}) {
    try {
      setLoading(true);
      const filterParams = {};
      if (filters.name) filterParams.name = filters.name;
      if (filters.document) filterParams.document = filters.document;
      if (filters.phone) filterParams.phone = filters.phone;
      if (filters.email) filterParams.email = filters.email;

      const response = await api.get("/api/v1/customer", {
        params: {
          page,
          size,
          ...filterParams,
        },
      });
      setCustomers(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // Buscar clientes sempre que a página ou o tamanho da página mudarem
  useEffect(() => {
    fetchCustomers(currentPage, pageSize, filters);
  }, [currentPage, pageSize]);

  // Alterar o tamanho da página
  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(0); // Reinicia para a primeira página ao mudar o tamanho
  };

  // Alterar a página
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Alterar o valor dos filtros
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  // Função de formatação de telefone
  const formatPhone = (phone) => {
    if (!phone) return phone;
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"); // Formata o número de telefone no formato (XX) XXXXX-XXXX
  };

  // Função de validação do nome (apenas letras)
  const validateName = (name) => {
    const regex = /^[A-Za-zÀ-ÿ\s]+$/; // Apenas letras e espaços
    return regex.test(name);
  };

  // Função de validação do documento (apenas números)
  const validateDocument = (document) => {
    const regex = /^\d+$/; // Apenas números
    return regex.test(document);
  };

  // Função de validação do telefone (apenas números e sem máscara)
  const validatePhone = (phone) => {
    const regex = /^\d{10,11}$/; // Apenas números e com 10 ou 11 dígitos
    return regex.test(phone);
  };

  // Função de validação do email (formato de email)
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  // Quando pressionar enter, faz a busca com os filtros
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchCustomers(currentPage, pageSize, filters);
    }
  };

  const handleCreateCustomer = () => {
    fetchCustomers(currentPage, pageSize, filters);
    closeModal();
  };

  const handleFeedback = (feedbackData) => {
    setFeedback(feedbackData);
  };

  const handleNewCustomer = () => {
    setEditingCustomer(null); // Define o cliente para edição
    openModal(); // Abre o modal
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer); // Define o cliente para edição
    openModal(); // Abre o modal
  };

  // Exibição de loading ou erro
  if (loading) return <p>Carregando clientes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "30px" }}>
      <Typography variant="h4" gutterBottom align="center">
        Lista de Clientes
      </Typography>

      {/* Botão "Novo" alinhado à direita e sem cor */}
      <Button
        variant="outlined"
        sx={{ float: "right", marginBottom: "20px" }}
        onClick={handleNewCustomer}
      >
        Novo
      </Button>
      <Feedback
        open={feedback.open}
        onClose={() => setFeedback({ ...feedback, open: false })}
        message={feedback.message}
        type={feedback.type}
      />
      {isModalOpen && (
        <CustomerModal
          open={isModalOpen}
          onClose={closeModal}
          onCreate={handleCreateCustomer}
          onFeedback={handleFeedback} // Passando o método de feedback para o modal
          customerToEdit={editingCustomer} // Passa o cliente selecionado para o modal
        />
      )}

      {/* Filtros */}
      <Grid container spacing={2} style={{ marginBottom: "20px" }}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Nome"
            variant="outlined"
            fullWidth
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            onKeyDown={handleKeyDown} // Dispara a busca com Enter
            error={filters.name && !validateName(filters.name)} // Valida só se houver conteúdo
            helperText={
              filters.name && !validateName(filters.name) ? "Nome inválido" : ""
            }
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Documento"
            variant="outlined"
            fullWidth
            name="document"
            value={filters.document}
            onChange={handleFilterChange}
            onKeyDown={handleKeyDown} // Dispara a busca com Enter
            error={filters.document && !validateDocument(filters.document)} // Valida só se houver conteúdo
            helperText={
              filters.document && !validateDocument(filters.document)
                ? "Documento inválido"
                : ""
            }
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Telefone"
            variant="outlined"
            fullWidth
            name="phone"
            value={formatPhone(filters.phone)} // Aplica a máscara do telefone
            onChange={(event) => handleFilterChange(event)} // Atualiza o telefone sem máscara
            onKeyDown={handleKeyDown} // Dispara a busca com Enter
            error={filters.phone && !validatePhone(filters.phone)} // Valida só se houver conteúdo
            helperText={
              filters.phone && !validatePhone(filters.phone)
                ? "Telefone inválido"
                : ""
            }
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="E-mail"
            variant="outlined"
            fullWidth
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            onKeyDown={handleKeyDown} // Dispara a busca com Enter
            error={filters.email && !validateEmail(filters.email)} // Valida só se houver conteúdo
            helperText={
              filters.email && !validateEmail(filters.email)
                ? "E-mail inválido"
                : ""
            }
          />
        </Grid>
      </Grid>

      {/* Tabela de clientes */}
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Nome</TableCell>
              <TableCell align="center">Documento</TableCell>
              <TableCell align="center">Telefone</TableCell>
              <TableCell align="center">E-mail</TableCell>
              <TableCell align="center">Ações</TableCell>{" "}
              {/* Coluna de ações */}
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow hover key={customer.id}>
                <TableCell align="center">{customer.id}</TableCell>
                <TableCell align="center">{customer.name}</TableCell>
                <TableCell align="center">{customer.document}</TableCell>

                {/* Mostrando o telefone formatado */}
                <TableCell align="center">
                  {formatPhone(customer.phone)}
                </TableCell>

                <TableCell align="center">{customer.email}</TableCell>

                {/* Coluna de ações com ícones */}
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={
                      () => alert(`Visualizar detalhes de ${customer.name}`) // Exemplo de ação de visualização
                    }
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleEditCustomer(customer)} // Chama a função de edição ao clicar no ícone de editar
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        count={totalElements} // total de itens
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handlePageSizeChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
        showFirstButton
        showLastButton
        labelRowsPerPage="Itens por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
      />
    </div>
  );
}
