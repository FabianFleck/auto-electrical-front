import { Modal, TextField, Button, Grid, Typography, Box } from "@mui/material";
import InputMask from "react-input-mask";
import api from "../services/api";
import { useState, useEffect } from "react";

export default function CustomerModal({
  open,
  onClose,
  onCreate,
  onFeedback,
  customerToEdit, // Novo parâmetro para editar cliente
}) {
  const [customer, setCustomer] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    name: false,
    document: false,
    phone: false,
    email: false,
  });

  const [documentLengthValid, setDocumentLengthValid] = useState(true); // Validação do documento

  useEffect(() => {
    if (customerToEdit) {
      // Se estiver editando, preenche os dados
      setCustomer(customerToEdit);
      console.log(customerToEdit);
    }
  }, [customerToEdit]);

  const validateFields = () => {
    const cleanedDocument = customer.document.replace(/\D/g, "");
    const newErrors = {
      name: !/^[A-Za-z\s]+$/.test(customer.name),
      document: !(
        cleanedDocument.length === 11 || cleanedDocument.length === 14
      ),
      phone: !/^\d{10,11}$/.test(customer.phone.replace(/\D/g, "")),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "document") {
      const numericValue = value.replace(/\D/g, "");
      setDocumentLengthValid(
        numericValue.length === 11 || numericValue.length === 14
      );
    }
    setCustomer({ ...customer, [name]: value });
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const formattedCustomer = {
      ...customer,
      document: customer.document.replace(/\D/g, ""),
      phone: customer.phone.replace(/\D/g, ""),
    };

    try {
      if (customerToEdit) {
        // Se for edição, faz o PUT
        await api.put(
          `/api/v1/customer/${customerToEdit.id}`,
          formattedCustomer
        );
      } else {
        // Se for criação, faz o POST
        await api.post("/api/v1/customer", formattedCustomer);
      }

      onFeedback({
        open: true,
        message: customerToEdit
          ? "Cliente atualizado com sucesso!"
          : "Cliente criado com sucesso!",
        type: "success",
      });
      onCreate(); // Chama a função de callback após o sucesso
      onClose(); // Fecha o modal
    } catch (error) {
      onFeedback({
        open: true,
        message: error.response.data.errors,
        type: "error",
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {customerToEdit ? "Editar Cliente" : "Novo Cliente"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome"
              name="name"
              value={customer.name}
              onChange={handleInputChange}
              error={errors.name}
              helperText={errors.name && "Nome deve conter apenas letras"}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Documento"
              name="document"
              value={customer.document}
              onChange={handleInputChange}
              error={errors.document || !documentLengthValid}
              helperText={
                (errors.document &&
                  "Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)") ||
                (!documentLengthValid && "Documento deve ter 11 ou 14 dígitos")
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <InputMask
              mask="(99) 99999-9999"
              value={customer.phone}
              onChange={handleInputChange}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="Telefone"
                  name="phone"
                  error={errors.phone}
                  helperText={
                    errors.phone && "Telefone deve ter 10 ou 11 números"
                  }
                  fullWidth
                />
              )}
            </InputMask>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="E-mail"
              name="email"
              value={customer.email}
              onChange={handleInputChange}
              error={errors.email}
              helperText={errors.email && "E-mail inválido"}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <Button onClick={onClose} fullWidth variant="outlined">
              Voltar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={handleSubmit}
              fullWidth
              variant="contained"
              color="primary"
            >
              {customerToEdit ? "Salvar Alterações" : "Criar"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}
