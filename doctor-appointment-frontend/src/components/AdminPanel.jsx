import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/pending-doctors`,
        { withCredentials: true }
      );
      setPendingDoctors(response.data.data);
    } catch (error) {
      console.error('Admin panel error:', error);
      setError('Error fetching pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/doctors/${doctorId}/approve`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Show success message
        setSuccessMessage('Doctor approved successfully');
        // Update the list
        fetchPendingDoctors();
      }
    } catch (error) {
      console.error('Error approving doctor:', error.response?.data);
      setError(error.response?.data?.message || 'Error approving doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/doctors/${doctorId}/reject`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Show success message
        setSuccessMessage('Doctor rejected successfully');
        // Update the list
        fetchPendingDoctors();
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error.response?.data);
      setError(error.response?.data?.message || 'Error rejecting doctor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingDoctors.map((doctor) => (
                <TableRow key={doctor._id}>
                  <TableCell>{doctor.fullName}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.address?.cityName}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleApprove(doctor._id)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleReject(doctor._id)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminPanel; 