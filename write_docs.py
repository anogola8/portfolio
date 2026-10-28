from pathlib import Path
# paste the same three string literals as above (SECURITY, DEPLOYMENT, CONTENT)
# and then:
Path("SECURITY.md").write_text(SECURITY, encoding="utf-8")
Path("DEPLOYMENT.md").write_text(DEPLOYMENT, encoding="utf-8")
Path("CONTENT_GUIDE.md").write_text(CONTENT, encoding="utf-8")
print("done")