import { DndProvider } from 'react-dnd';
import './App.css';
import StatusList from './components/statusList';
import { Box } from '@mui/material';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from './types';

function App() {
    const handleTaskMove = (task: Task, newStatus: string) => {
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

    return (
        <DndProvider backend={HTML5Backend}>
            <Box
                sx={{
                    width: 'auto',
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, 1fr)',
                    },
                    gap: 4,
                    p: 4,
                    justifyContent: 'start',
                    alignItems: 'start',
                    margin: 0,
                }}
            >
                <StatusList status="Not started" onTaskMove={handleTaskMove} />
                <StatusList status="In progress" onTaskMove={handleTaskMove} />
                <StatusList status="Completed" onTaskMove={handleTaskMove} />
            </Box>
        </DndProvider>
    );
}

export default App;
