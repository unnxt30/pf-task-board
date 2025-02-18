import { DndProvider } from 'react-dnd';
import './App.css';
import StatusList from './components/statusList';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from './types';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useEffect } from 'react';

function App() {
    const [statuses, setStatuses] = useState<string[]>(() => {
        const savedStatuses = localStorage.getItem('boardStatuses');
        return savedStatuses
            ? JSON.parse(savedStatuses)
            : ['Not started', 'In progress', 'Completed'];
    });

    useEffect(() => {
        localStorage.setItem('boardStatuses', JSON.stringify(statuses));
    }, [statuses]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const handleTaskMove = (task: Task, newStatus: string) => {
        // Verify the status exists
        if (!statuses.includes(newStatus)) {
            console.error('Invalid status:', newStatus);
            return;
        }

        const currentTasks = JSON.parse(
            localStorage.getItem(`tasks-${newStatus}`) || '[]'
        );

        const oldTasks = JSON.parse(
            localStorage.getItem(`tasks-${task.status}`) || '[]'
        );

        const updatedOldTasks = oldTasks.filter(
            (t: Task) =>
                t.name !== task.name || t.description !== task.description
        );

        localStorage.setItem(
            `tasks-${task.status}`,
            JSON.stringify(updatedOldTasks)
        );

        const updatedTasks = [...currentTasks, { ...task, status: newStatus }];
        localStorage.setItem(
            `tasks-${newStatus}`,
            JSON.stringify(updatedTasks)
        );

        window.dispatchEvent(
            new CustomEvent('localStorageUpdate', {
                detail: {
                    key: `tasks-${task.status}`,
                    newValue: JSON.stringify(updatedOldTasks),
                },
            })
        );
        window.dispatchEvent(
            new CustomEvent('localStorageUpdate', {
                detail: {
                    key: `tasks-${newStatus}`,
                    newValue: JSON.stringify(updatedTasks),
                },
            })
        );
    };

    const handleAddStatus = () => {
        if (newStatus.trim() && !statuses.includes(newStatus.trim())) {
            setStatuses([...statuses, newStatus.trim()]);
            setNewStatus('');
            setOpenDialog(false);
        }
    };

    const handleRemoveStatus = (statusToRemove: string) => {
        // Don't allow removing default statuses
        if (
            ['Not started', 'In progress', 'Completed'].includes(statusToRemove)
        ) {
            return;
        }
        setStatuses(statuses.filter((status) => status !== statusToRemove));
        // Clean up localStorage for removed status
        localStorage.removeItem(`tasks-${statusToRemove}`);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{ p: 4 }}>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add New Status
                    </Button>
                </Box>

                <Box
                    sx={{
                        width: 'auto',
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: `repeat(${Math.min(statuses.length, 4)}, 1fr)`,
                        },
                        gap: 4,
                        justifyContent: 'start',
                        alignItems: 'start',
                    }}
                >
                    {statuses.map((status) => (
                        <StatusList
                            key={status}
                            status={status}
                            onTaskMove={handleTaskMove}
                            availableStatuses={statuses}
                            onRemoveStatus={handleRemoveStatus}
                            isRemovable={
                                ![
                                    'Not started',
                                    'In progress',
                                    'Completed',
                                ].includes(status)
                            }
                        />
                    ))}
                </Box>
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New Status</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Status Name"
                        fullWidth
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        error={statuses.includes(newStatus.trim())}
                        helperText={
                            statuses.includes(newStatus.trim())
                                ? 'Status already exists'
                                : ''
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddStatus}
                        disabled={
                            !newStatus.trim() ||
                            statuses.includes(newStatus.trim())
                        }
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </DndProvider>
    );
}

export default App;
