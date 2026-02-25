import { NextResponse } from 'next/server';
import os from 'os';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        // CPU info
        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || 'Unknown';
        const cpuCores = cpus.length;

        // CPU usage (average across cores)
        const cpuUsage = cpus.map(cpu => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            const idle = cpu.times.idle;
            return ((total - idle) / total) * 100;
        });
        const avgCpuUsage = cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length;

        // Memory info
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = (usedMem / totalMem) * 100;

        // Machine ID (hash of hostname + platform + arch for a stable pseudo-ID)
        const machineRaw = `${os.hostname()}-${os.platform()}-${os.arch()}-${cpuModel}-${totalMem}`;
        const machineId = createHash('md5').update(machineRaw).digest('hex').substring(0, 12).toUpperCase();

        // System info
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        const uptime = os.uptime(); // seconds
        const nodeVersion = process.version;

        return NextResponse.json({
            cpu: {
                model: cpuModel,
                cores: cpuCores,
                usage: Math.round(avgCpuUsage * 10) / 10, // e.g. 23.5
            },
            memory: {
                total: totalMem,
                used: usedMem,
                free: freeMem,
                usagePercent: Math.round(memUsagePercent * 10) / 10,
            },
            machine: {
                id: machineId,
                hostname,
                platform,
                arch,
                uptime,
                nodeVersion,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || '系统信息获取失败喵...' }, { status: 500 });
    }
}
