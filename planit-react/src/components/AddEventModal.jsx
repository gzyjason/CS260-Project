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
const findNextAvailableSlot = (duration, existingAppointments, unavailableTimes) => {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    let searchDate = new Date();
    const currentMinutes = searchDate.getMinutes();
    if (currentMinutes > 0 && currentMinutes <= 30) {
        searchDate.setMinutes(30, 0, 0);
    } else if (currentMinutes > 30) {
        searchDate.setHours(searchDate.getHours() + 1, 0, 0, 0);
    } else {
        searchDate.setMinutes(0, 0, 0);
    }

    if (searchDate.getHours() >= 17) {
        searchDate.setDate(searchDate.getDate() + 1);
        searchDate.setHours(9, 0, 0, 0);
    }
    if (searchDate.getHours() < 9) {
        searchDate.setHours(9, 0, 0, 0);
    }
    for (let i = 0; i < 30; i++) {
        console.log(`Searching day: ${searchDate.toLocaleDateString()}`);
        const dayOfWeek = searchDate.getDay();
        if (dayOfWeek > 0 && dayOfWeek < 6) {
            for (let hour = searchDate.getHours(); hour < 17; hour++) {
                for (let minute = (hour === searchDate.getHours() ? searchDate.getMinutes() : 0); minute < 60; minute += 30) {
                    const potentialEndDate = new Date(searchDate);
                    potentialEndDate.setHours(hour, minute, 0, 0);
                    potentialEndDate.setHours(potentialEndDate.getHours() + duration);
                    if (potentialEndDate.getHours() > 17 || (potentialEndDate.getHours() === 17 && potentialEndDate.getMinutes() > 0)) {
                        continue;
                    }
                    const currentSearchTime = new Date(searchDate);
                    currentSearchTime.setHours(hour, minute, 0, 0);

                    const newAppt = {
                        date: new Date(currentSearchTime),
                        durationHours: duration
                    };

                    console.log(`-- Checking slot: ${newAppt.date.toLocaleString()} for ${duration} hours`);

                    if (isSlotAvailable(newAppt, existingAppointments, unavailableTimes, dayNames)) {
                        console.log("-----> Slot FOUND!");
                        return newAppt.date;
                    }
                }
                if (hour < 16) searchDate.setMinutes(0, 0, 0);
            }
        }
        searchDate.setDate(searchDate.getDate() + 1);
        searchDate.setHours(9, 0, 0, 0);
    }
    console.log("No slot found within 30 days.");
    return null;
};
