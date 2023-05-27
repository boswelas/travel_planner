// Adapted from Material-UI: https://mui.com/material-ui/react-menu/
import styles from '@/styles/ExpCard.module.css';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';


export default function AddToTripDropdown({ experience_id }) {
    const { user, getToken } = useAuth();
    const [open, setOpen] = useState(false); // State for tracking if dropdown menu open
    const [addedToTrip, setAddedToTrip] = useState(false); // State for tracking if added to trip
    const anchorRef = useRef(null);
    const [menuItems, setMenuItems] = useState([]); // State for dropdown menu items

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = async (event, selectedIndex) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);

        if (typeof selectedIndex !== 'undefined') {
            // Get the trip ID from the selected menu item
            const selectedMenuItem = menuItems[selectedIndex];
            const trip_id = selectedMenuItem[0];

            // Add the experience to the trip
            try {
                const token = await getToken();
                const response = await fetch('https://travel-planner-production.up.railway.app/addExperienceToTrip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        trip_id,
                        experience_id,
                    }),
                });

                const data = await response.json();
                console.log(data);

                // Set addedToTrip state to true
                setAddedToTrip(true);
            } catch (error) {
                console.error(error);
            }
        }
    };


    // Handles key events in the dropdown menu
    const handleListKeyDown = (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    // Get the user's trips from the database
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const token = await getToken();
                const response = await fetch('https://travel-planner-production.up.railway.app/trip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user.uid,
                    }),
                });

                const data = await response.json();
                if (data.trip === 'invalid') {
                    setMenuItems([]);
                } else {
                    setMenuItems(data.trip);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (user) {
            fetchMenuItems();
        }
    }, [user]);

    return (
        <Stack direction="row" spacing={2}>
            <div>
                {addedToTrip && (
                    <div className={styles.Added}>
                        Added!
                    </div>
                )}
            </div>
            <div>                <Button
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? 'composition-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
            >
                Add to Trip
            </Button>
                <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <List
                                        autoFocus={open}
                                        id="composition-menu"
                                        aria-labelledby="composition-button"
                                        onKeyDown={handleListKeyDown}
                                        className={styles.menuList} 
                                    >
                                        {menuItems.length === 0 ? (
                                            <MenuItem disabled>No Trips Saved</MenuItem>
                                        ) : (
                                            menuItems.map((menuItem, index) => (
                                                <MenuItem
                                                    key={menuItem[0]}
                                                    onClick={(event) => handleClose(event, index)}
                                                >
                                                    {menuItem[2]}
                                                </MenuItem>
                                            ))
                                        )}
                                    </List>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        </Stack>
    );
}
