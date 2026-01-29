function solve(s) {
    const t = "tbank";
    const u = "study";
    const len = 5;
    const n = s.length;
    
    const cost_t = new Array(n - len + 1);
    const cost_s = new Array(n - len + 1);
    
    for (let i = 0; i <= n - len; i++) {
        let ct = 0;
        let cs = 0;
        for (let p = 0; p < len; p++) {
            if (s[i + p] !== t[p]) ct++;
            if (s[i + p] !== u[p]) cs++;
        }
        cost_t[i] = ct;
        cost_s[i] = cs;
    }
    
    let ans = Infinity;
    
    const min_suffix = new Array(n - len + 1);
    min_suffix[n - len] = cost_s[n - len];
    for (let j = n - len - 1; j >= 0; j--) {
        min_suffix[j] = Math.min(cost_s[j], min_suffix[j + 1]);
    }
    
    const min_prefix = new Array(n - len + 1);
    min_prefix[0] = cost_s[0];
    for (let j = 1; j <= n - len; j++) {
        min_prefix[j] = Math.min(cost_s[j], min_prefix[j - 1]);
    }
    
    for (let i = 0; i <= n - len; i++) {
        if (i + len <= n - len) {
            ans = Math.min(ans, cost_t[i] + min_suffix[i + len]);
        }
        if (i - len >= 0) {
            ans = Math.min(ans, cost_t[i] + min_prefix[i - len]);
        }
    }
    
    for (let i = 0; i <= n - len; i++) {
        for (let d = -4; d <= 4; d++) {
            if (d === 0) continue;
            const j = i + d;
            if (j < 0 || j > n - len) continue;
            
           
            const start_overlap = Math.max(0, -d);
            const end_overlap = Math.min(4, 4 - d);
            let compatible = true;
            for (let p = start_overlap; p <= end_overlap; p++) {
                if (t[p] !== u[p + d]) {
                    compatible = false;
                    break;
                }
            }
            if (!compatible) continue;
            
            let cost = 0;
            const start_pos = Math.min(i, j);
            const end_pos = Math.max(i + 4, j + 4);
            for (let pos = start_pos; pos <= end_pos; pos++) {
                let need = null;
                const in1 = (i <= pos && pos <= i + 4);
                const in2 = (j <= pos && pos <= j + 4);
                if (in1 && in2) {
                    need = t[pos - i]; 
                } else if (in1) {
                    need = t[pos - i];
                } else if (in2) {
                    need = u[pos - j];
                } else {
                    continue;
                }
                if (s[pos] !== need) cost++;
            }
            ans = Math.min(ans, cost);
        }
    }
    
    return ans;
}

console.log(solve("tbankstudy"))

