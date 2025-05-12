import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = 'http://backend:5000/api/costs';

const CostListPanel = forwardRef(({ onEditCost }, ref) => {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch costs');
      }
      const data = await response.json();
      setCosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchCosts method to parent component
  useImperativeHandle(ref, () => ({
    fetchCosts
  }));

  useEffect(() => {
    fetchCosts();
  }, []);

  const handleDelete = async (costId) => {
    if (!window.confirm('Are you sure you want to delete this cost?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${costId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cost');
      }

      setCosts(costs.filter(cost => cost._id !== costId));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCosts = costs.filter(cost => {
    const searchLower = searchQuery.toLowerCase();
    return (
      cost.client?.name?.toLowerCase().includes(searchLower) ||
      cost.client?.phoneNumber?.includes(searchQuery) ||
      cost.client?.email?.toLowerCase().includes(searchLower) ||
      cost.totalPrice?.toString().includes(searchQuery) ||
      cost.finalPrice?.toString().includes(searchQuery)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalPrice = (cost) => {
      if (cost.selectedPriceType === 'percentage') {
        return cost.finalPrice - cost.profitWithPercentage;
      }
      else {
        return cost.finalPrice - cost.profitWithAmount;
      }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 350,
        height: 'calc(100vh - 64px)', // Subtract header height
        position: 'fixed',
        right: 0,
        top: 64, // Header height
        overflow: 'auto',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h5"  sx={{ mb: 2, fontWeight: 'bold' }}>
          Cost List
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search costs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <List>
          {filteredCosts.map((cost) => (
            <React.Fragment key={cost._id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        onClick={() => onEditCost(cost)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(cost._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={cost.client?.name || 'Unnamed Client'}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        Total: {totalPrice(cost)}
                      </Typography>
                      <br />
                      <Typography variant="body2" component="span">
                        Final: {cost.finalPrice}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          {filteredCosts.length === 0 && (
            <ListItem>
              <ListItemText primary="No costs found" />
            </ListItem>
          )}
        </List>
      </Box>
    </Paper>
  );
});

export default CostListPanel; 