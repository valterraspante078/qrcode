import subprocess
import os

def run_cmd(args):
    print(f"Running: {' '.join(args)}")
    res = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    print(f"STDOUT:\n{res.stdout}")
    print(f"STDERR:\n{res.stderr}")
    print(f"Exit code: {res.returncode}\n")
    return res

def main():
    os.makedirs("tmp", exist_ok=True)
    log_path = "tmp/git_output.txt"
    
    # Save stdout to file
    import sys
    class Logger(object):
        def __init__(self):
            self.terminal = sys.stdout
            self.log = open(log_path, "w", encoding="utf-8")
        def write(self, message):
            self.terminal.write(message)
            self.log.write(message)
        def flush(self):
            self.terminal.flush()
            self.log.flush()
            
    sys.stdout = Logger()
    sys.stderr = sys.stdout

    print("--- GIT DEPLOY START ---")
    
    # 1. Git Status
    run_cmd(["git", "status"])
    
    # 2. Git Remote Check
    run_cmd(["git", "remote", "-v"])
    
    # 3. Add all changes
    run_cmd(["git", "add", "-A"])
    
    # 4. Commit
    run_cmd(["git", "commit", "-m", "feat: implement dark mode toggle, remove unused code, optimize SEO"])
    
    # 5. Push
    # Let's check current branch first
    res_branch = run_cmd(["git", "branch", "--show-current"])
    branch = res_branch.stdout.strip() if res_branch.returncode == 0 else "main"
    if not branch:
        branch = "main"
        
    run_cmd(["git", "push", "origin", branch])
    
    print("--- GIT DEPLOY END ---")

if __name__ == "__main__":
    main()
