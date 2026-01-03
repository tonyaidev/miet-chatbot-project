import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Link as LinkIcon, Globe } from 'lucide-react';

const Admin = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('file'); // 'file' or 'url'

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a file first.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setStatus({ type: 'info', message: 'Uploading and processing...' });

        try {
            const response = await axios.post('http://localhost:8000/uploadknowledgebase', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: response.data.message });
            setFile(null);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'Upload failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUrlTrain = async () => {
        if (!url) {
            setStatus({ type: 'error', message: 'Please enter a URL first.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Crawling and processing URL...' });

        try {
            const response = await axios.post('http://localhost:8000/trainurl', { url });
            setStatus({ type: 'success', message: response.data.message });
            setUrl('');
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'URL training failed.' });
        } finally {
            setLoading(false);
        }
    };

    const tabStyle = (tab) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
        color: activeTab === tab ? 'var(--primary)' : '#666',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    return (
        <div className="container" style={{ padding: '80px 0', maxWidth: '700px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '25px', boxShadow: 'var(--shadow)' }}>
                <h2 style={{ marginBottom: '10px', color: 'var(--primary)', textAlign: 'center' }}>AI Training Lab</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Expand the chatbot's knowledge by syncing files or web pages.</p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', borderBottom: '1px solid #eee' }}>
                    <div style={tabStyle('file')} onClick={() => setActiveTab('file')}>
                        <FileText size={18} /> Documents
                    </div>
                    <div style={tabStyle('url')} onClick={() => setActiveTab('url')}>
                        <Globe size={18} /> Website / URLs
                    </div>
                </div>

                {activeTab === 'file' ? (
                    <div className="upload-section">
                        <div style={{
                            border: '2px dashed #003366',
                            padding: '40px',
                            borderRadius: '15px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            marginBottom: '20px',
                            background: '#f9f9f9',
                            transition: 'background 0.3s'
                        }} onClick={() => document.getElementById('fileInput').click()}>
                            <Upload size={48} color="#003366" style={{ marginBottom: '10px' }} />
                            <p style={{ fontWeight: '500' }}>{file ? file.name : "Upload Training Data"}</p>
                            <p style={{ fontSize: '13px', color: '#666' }}>Supported formats: PDF, TXT, DOCX</p>
                            <input
                                id="fileInput"
                                type="file"
                                accept=".pdf,.txt,.docx"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: file && !loading ? 'pointer' : 'not-allowed',
                                opacity: file && !loading ? 1 : 0.5,
                                fontSize: '16px'
                            }}
                        >
                            {loading ? "Syncing Knowledge..." : "Sync Document to AI"}
                        </button>
                    </div>
                ) : (
                    <div className="url-section">
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Enter College Website URL or Resource Link:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#f5f5f5',
                                    borderRadius: '12px',
                                    padding: '0 15px',
                                    border: '1px solid #ddd'
                                }}>
                                    <LinkIcon size={18} color="#666" />
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://miet.edu/about..."
                                        style={{
                                            width: '100%',
                                            padding: '15px 10px',
                                            border: 'none',
                                            background: 'transparent',
                                            outline: 'none',
                                            fontSize: '15px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleUrlTrain}
                            disabled={loading || !url}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: url && !loading ? 'pointer' : 'not-allowed',
                                opacity: url && !loading ? 1 : 0.5,
                                fontSize: '16px'
                            }}
                        >
                            {loading ? "Crawling Data..." : "Sync Website to AI"}
                        </button>
                    </div>
                )}

                {status.message && (
                    <div style={{
                        marginTop: '25px',
                        padding: '15px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: status.type === 'error' ? '#ffeeee' : status.type === 'success' ? '#eeffee' : '#f0f7ff',
                        color: status.type === 'error' ? '#cc0000' : status.type === 'success' ? '#007700' : '#0055ff',
                        border: `1px solid ${status.type === 'error' ? '#ffcccc' : status.type === 'success' ? '#ccffcc' : '#cce5ff'}`,
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{status.message}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
