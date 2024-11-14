// Feedback.js
import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function Feedback({ open, onClose, message, type }) {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <Alert onClose={onClose} severity={type} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
