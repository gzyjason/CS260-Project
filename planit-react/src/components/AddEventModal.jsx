import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext.js';

const isSlotAvailable = (newAppt, existingAppointments, unavailableTimes, dayNames) => {
    const newStart = newAppt.date.getTime();
    const newEnd = newStart + newAppt.durationHours * 60 * 60 * 1000;
    const newDay = dayNames[newAppt.date.getDay()];

    for (const unavail of unavailableTimes) {
        if (unavail.day === newDay) {
            const [unavailStartHour, unavailStartMin] = unavail.startTime.split(':').map(Number);
            const [unavailEndHour, unavailEndMin] = unavail.endTime.split(':').map(Number);
            const unavailStartDate = new Date(newAppt.date);
            unavailStartDate.setHours(unavailStartHour, unavailStartMin, 0, 0);
            const unavailEndDate = new Date(newAppt.date);
            unavailEndDate.setHours(unavailEndHour, unavailEndMin, 0, 0);
            if (newStart < unavailEndDate.getTime() && newEnd > unavailStartDate.getTime()) {
                console.log(`Conflict with unavailable: ${unavail.day} ${unavail.startTime}-${unavail.endTime}`);
                return false;
            }
        }
    }
    for (const existing of existingAppointments) {
        const existingStart = existing.date.getTime();
        const existingEnd = existingStart + existing.durationHours * 60 * 60 * 1000;
        if (newStart < existingEnd && newEnd > existingStart) {
            console.log(`Conflict with existing: ${existing.title} at ${existing.date.toLocaleString()}`);
            return false;
        }
    }
    return true;
};