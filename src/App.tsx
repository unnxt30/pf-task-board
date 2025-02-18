import { DndProvider } from 'react-dnd';
import './App.css';
import StatusList from './components/statusList';
import { Box } from '@mui/material';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
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
                <StatusList status="Not started" />
                <StatusList status="In progress" />
                <StatusList status="Completed" />
            </Box>
        </DndProvider>
    );
}

export default App;
