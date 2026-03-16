export const exportToCsv = (filename, data) => {
    if (!data || !data.length) {
        return;
    }

    // Replace undefined/null with empty strings
    const replacer = (key, value) => (value === null || value === undefined ? '' : value);

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Build the CSV string
    const csv = [
        headers.join(','), // CSV header row
        ...data.map((row) =>
            headers
                .map((fieldName) => {
                    let cellData = row[fieldName];
                    
                    // Format objects or arrays roughly
                    if (typeof cellData === 'object' && cellData !== null) {
                        try {
                            cellData = JSON.stringify(cellData);
                        } catch (e) {
                            cellData = '';
                        }
                    }

                    // Escape quotes and wrap in quotes if there's a comma
                    const stringData = String(replacer(fieldName, cellData));
                    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                        return `"${stringData.replace(/"/g, '""')}"`;
                    }
                    return stringData;
                })
                .join(',')
        )
    ].join('\r\n');

    // Create a Blob and trigger a download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
