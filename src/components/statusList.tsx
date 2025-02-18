'use client';

import * as React from 'react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
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
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useDrag, useDrop } from 'react-dnd';
import { useCallback } from 'react';
import { Task } from '../types';

interface StatusListProps {
    status: string;
    onTaskMove?: (task: Task, newStatus: string) => void;
}

const statusColors: { [key: string]: string } = {
    'Not started': '#FFA500',
    'In progress': '#FFD700',
    Completed: '#00BFFF',
};

export default function StatusList({ status, onTaskMove }: StatusListProps) {
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
    const [editOpen, setEditOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Task | null>(null);
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

    // Add event listener for storage changes
    React.useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `tasks-${status}`) {
                const newTasks = e.newValue ? JSON.parse(e.newValue) : [];
                setTasks(newTasks);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [status]);

    // Add a custom event for same-window updates
    const emitLocalStorageUpdate = (newTasks: Task[]) => {
        const event = new CustomEvent('localStorageUpdate', {
            detail: {
                key: `tasks-${status}`,
                newValue: JSON.stringify(newTasks),
            },
        });
        window.dispatchEvent(event);
    };

    React.useEffect(() => {
        const handleLocalUpdate = (e: CustomEvent) => {
            if (e.detail.key === `tasks-${status}`) {
                const newTasks = JSON.parse(e.detail.newValue);
                setTasks(newTasks);
            }
        };

        window.addEventListener(
            'localStorageUpdate',
            handleLocalUpdate as EventListener
        );
        return () =>
            window.removeEventListener(
                'localStorageUpdate',
                handleLocalUpdate as EventListener
            );
    }, [status]);

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

    const moveListItem = useCallback(
        (dragIndex: number, hoverIndex: number) => {
            const dragTask = tasks[dragIndex];
            setTasks((prevTasks) => {
                const updatedTasks = [...prevTasks];
                updatedTasks.splice(dragIndex, 1);
                updatedTasks.splice(hoverIndex, 0, dragTask);
                localStorage.setItem(
                    `tasks-${status}`,
                    JSON.stringify(updatedTasks)
                );
                return updatedTasks;
            });
        },
        [tasks, status]
    );

    const handleEditTask = (task: Task, index: number) => {
        setEditingTask(task);
        setEditingIndex(index);
        setEditOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingTask && editingIndex !== null) {
            if (editingTask.status !== status && onTaskMove) {
                onTaskMove(editingTask, editingTask.status);
                const updatedTasks = tasks.filter((_, i) => i !== editingIndex);
                setTasks(updatedTasks);
                localStorage.setItem(
                    `tasks-${status}`,
                    JSON.stringify(updatedTasks)
                );
                emitLocalStorageUpdate(updatedTasks);
            } else {
                const updatedTasks = [...tasks];
                updatedTasks[editingIndex] = editingTask;
                setTasks(updatedTasks);
                localStorage.setItem(
                    `tasks-${status}`,
                    JSON.stringify(updatedTasks)
                );
                emitLocalStorageUpdate(updatedTasks);
            }
            setEditOpen(false);
            setEditingTask(null);
            setEditingIndex(null);
        }
    };

    const statusColor = statusColors[status] || '#000';

    const [, dropRef] = useDrop<{ task: Task }, void, any>({
        accept: 'task',
        drop: (item: { task: Task }) => {
            if (item.task.status !== status) {
                onTaskMove?.(item.task, status);
            }
        },
    });

    return (
        <div ref={dropRef as unknown as React.RefObject<HTMLDivElement>}>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 360,
                    bgcolor: 'background.paper',
                    minHeight: '100px',
                    padding: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                }}
            >
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
                        <StatusListItem
                            key={index}
                            task={task}
                            index={index}
                            handleDeleteTask={handleDeleteTask}
                            handleEditTask={handleEditTask}
                            moveListItem={moveListItem}
                        />
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
                        <Button
                            onClick={handleAddTask}
                            disabled={!taskName.trim()}
                        >
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Task Name"
                            fullWidth
                            value={editingTask?.name || ''}
                            onChange={(e) =>
                                setEditingTask((prev) =>
                                    prev
                                        ? { ...prev, name: e.target.value }
                                        : null
                                )
                            }
                        />
                        <TextField
                            margin="dense"
                            label="Task Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={editingTask?.description || ''}
                            onChange={(e) =>
                                setEditingTask((prev) =>
                                    prev
                                        ? {
                                              ...prev,
                                              description: e.target.value,
                                          }
                                        : null
                                )
                            }
                        />
                        <TextField
                            select
                            margin="dense"
                            label="Status"
                            fullWidth
                            value={editingTask?.status || status}
                            onChange={(e) =>
                                setEditingTask((prev) =>
                                    prev
                                        ? { ...prev, status: e.target.value }
                                        : null
                                )
                            }
                        >
                            {Object.keys(statusColors).map((statusOption) => (
                                <MenuItem
                                    key={statusOption}
                                    value={statusOption}
                                >
                                    {statusOption}
                                </MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={!editingTask?.name.trim()}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
}

interface StatusListItemProps {
    task: Task;
    index: number;
    handleDeleteTask: (index: number) => void;
    handleEditTask: (task: Task, index: number) => void;
    moveListItem: (dragIndex: number, hoverIndex: number) => void;
}

function StatusListItem({
    task,
    index,
    handleDeleteTask,
    handleEditTask,
    moveListItem,
}: StatusListItemProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [, dragRef] = useDrag({
        type: 'task',
        item: { index, task },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, dropRef] = useDrop({
        accept: 'task',
        hover: (item: { index: number }, monitor) => {
            const dragIndex = item.index;
            const hoverIndex = index;
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            if (!hoverBoundingRect) return;
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const hoverActualY =
                (monitor.getClientOffset()?.y || 0) - hoverBoundingRect.top;

            // if dragging down, continue only when hover is smaller than middle Y
            if (dragIndex === hoverIndex) return; // Prevent redundant updates
            if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return;

            moveListItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const dragDropRef = dropRef(dragRef(ref));

    return (
        <div ref={dragDropRef as React.Ref<HTMLDivElement>}>
            <Card
                sx={{ ':hover': { cursor: 'pointer' } }}
                variant="outlined"
                onClick={() => handleEditTask(task, index)}
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
                            <Typography variant="body2" color="text.secondary">
                                {task.description}
                            </Typography>
                        )}
                    </Box>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(index);
                        }}
                        size="small"
                        color="error"
                    >
                        <RemoveIcon />
                    </IconButton>
                </CardContent>
            </Card>
        </div>
    );
}
