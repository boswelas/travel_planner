import React, { useState, useEffect } from 'react';

export default function UserTable() {

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>99</td>
                    <td>Bobby</td>
                    <td>Hill</td>
                </tr>
            </tbody>
        </table>
    )
}