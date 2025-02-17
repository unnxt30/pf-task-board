import './App.css';
import StatusList from './components/statusList';
import { Box } from '@mui/material';

function App() {
    return (
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
    );
}

export default App;
