'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Typography,
    Stack,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface StatusListProps {
    status: string;
}

interface Task {
    name: string;
    description: string;
    status: string;
}

const statusColors: { [key: string]: string } = {
    'Not started': '#FFA500',
    'In progress': '#FFD700',
    Completed: '#00BFFF',
};

export default function StatusList({ status }: StatusListProps) {
    const [open, setOpen] = React.useState(false);
    const [taskName, setTaskName] = React.useState('');
    const [taskDescription, setTaskDescription] = React.useState('');
    const [tasks, setTasks] = React.useState<Task[]>(() => {
        try {
            const storedTasks = localStorage.getItem(`tasks-${status}`);
            return storedTasks ? JSON.parse(storedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }); // This method initializes the tasks directly from localStorage before rendering.

    React.useEffect(() => {
        localStorage.setItem(`tasks-${status}`, JSON.stringify(tasks));
    }, [tasks, status]);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddTask = () => {
        if (taskName.trim()) {
            const newTask: Task = {
                name: taskName.trim(),
                description: taskDescription.trim(),
                status: status,
            };
            setTasks((prevTasks) => [...prevTasks, newTask]);
            setTaskName('');
            setTaskDescription('');
            setOpen(false);
        }
    };

    const handleDeleteTask = (index: number) => {
        setTasks((prevTasks) => {
            const updatedTasks = prevTasks.filter((_, i) => i !== index);
            localStorage.setItem(
                `tasks-${status}`,
                JSON.stringify(updatedTasks)
            );
            return updatedTasks;
        });
    };

    const handleClearTasks = () => {
        setTasks([]);
        localStorage.removeItem(`tasks-${status}`);
    };

    const statusColor = statusColors[status] || '#000';

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                    label={status}
                    size="small"
                    sx={{
                        backgroundColor: statusColor,
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontWeight: 'medium',
                        mr: 1,
                    }}
                />
                <Typography variant="body2" color="text.secondary">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </Typography>
                <IconButton
                    onClick={handleClickOpen}
                    size="small"
                    sx={{ ml: 'auto' }}
                >
                    <AddIcon />
                </IconButton>
                {tasks.length > 0 && (
                    <Button
                        onClick={handleClearTasks}
                        size="small"
                        color="error"
                    >
                        Clear
                    </Button>
                )}
            </Box>

            <Stack spacing={1}>
                {tasks.map((task, index) => (
                    <Card
                        key={index}
                        sx={{ ':hover': { cursor: 'pointer' } }}
                        variant="outlined"
                    >
                        <CardContent
                            sx={{
                                p: 2,
                                '&:last-child': { pb: 2 },
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    {task.name}
                                </Typography>
                                {task.description && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {task.description}
                                    </Typography>
                                )}
                            </Box>
                            <IconButton
                                onClick={() => handleDeleteTask(index)}
                                size="small"
                                color="error"
                            >
                                <RemoveIcon />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Task</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Task Name"
                        fullWidth
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Task Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleAddTask} disabled={!taskName.trim()}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
