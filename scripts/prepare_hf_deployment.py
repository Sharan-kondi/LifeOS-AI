import os
import shutil
import subprocess

def prepare_deployment():
    src_dir = "c:\\Users\\Shara\\Projects\\LifeOS-AI"
    deploy_dir = os.path.join(src_dir, "deploy-hf")
    
    print("🧹 Cleaning up old deployment directory if exists...")
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
        
    os.makedirs(deploy_dir, exist_ok=True)
    
    print("📁 Copying Dockerfile and requirements.txt...")
    shutil.copy(os.path.join(src_dir, "ai-services", "Dockerfile"), os.path.join(deploy_dir, "Dockerfile"))
    shutil.copy(os.path.join(src_dir, "ai-services", "requirements.txt"), os.path.join(deploy_dir, "requirements.txt"))
    
    print("📁 Copying FastAPI app directory...")
    shutil.copytree(os.path.join(src_dir, "ai-services", "app"), os.path.join(deploy_dir, "app"))
    
    print("📁 Copying ML models...")
    shutil.copytree(os.path.join(src_dir, "ml-models"), os.path.join(deploy_dir, "ml-models"))
    
    print("📁 Copying datasets...")
    shutil.copytree(os.path.join(src_dir, "datasets"), os.path.join(deploy_dir, "datasets"))
    
    print("⚙️ Initializing Git in deployment directory...")
    subprocess.run(["git", "init"], cwd=deploy_dir, check=True)
    subprocess.run(["git", "checkout", "-b", "main"], cwd=deploy_dir, check=True)
    
    print("⚙️ Adding Hugging Face Space remote...")
    # Add remote
    subprocess.run(["git", "remote", "add", "origin", "https://huggingface.co/spaces/Sharan8197/lifeos-ai-service"], cwd=deploy_dir, check=True)
    
    # Create deploy script for windows
    bat_content = (
        "@echo off\n"
        "echo ==========================================\n"
        "echo 🚀 Pushing AI Microservice to Hugging Face...\n"
        "echo ==========================================\n"
        "git add .\n"
        "git commit -m \"Deploy AI Service with ML models and datasets\"\n"
        "echo.\n"
        "echo IMPORTANT: Git will ask for your credentials.\n"
        "echo - Username: Sharan8197\n"
        "echo - Password: [Your Hugging Face Write Token]\n"
        "echo Generate a Write Token at https://huggingface.co/settings/tokens\n"
        "echo.\n"
        "git push origin main --force\n"
        "pause\n"
    )
    with open(os.path.join(deploy_dir, "deploy.bat"), "w", encoding="utf-8") as f:
        f.write(bat_content)
        
    # Create deploy script for linux/mac
    sh_content = (
        "#!/bin/bash\n"
        "echo \"==========================================\"\n"
        "echo \"🚀 Pushing AI Microservice to Hugging Face...\"\n"
        "echo \"==========================================\"\n"
        "git add .\n"
        "git commit -m \"Deploy AI Service with ML models and datasets\"\n"
        "echo\n"
        "echo \"IMPORTANT: Git will ask for your credentials.\"\n"
        "echo \"- Username: Sharan8197\"\n"
        "echo \"- Password: [Your Hugging Face Write Token]\"\n"
        "echo \"Generate a Write Token at https://huggingface.co/settings/tokens\"\n"
        "echo\n"
        "git push origin main --force\n"
    )
    with open(os.path.join(deploy_dir, "deploy.sh"), "w", encoding="utf-8") as f:
        f.write(sh_content)
        
    print("\n✅ Hugging Face deployment environment prepared successfully!")
    print(f"Directory: {deploy_dir}")
    print("Double-click deploy.bat inside the 'deploy-hf' folder to push to Hugging Face!")

if __name__ == "__main__":
    prepare_deployment()
