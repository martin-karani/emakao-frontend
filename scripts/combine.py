from pathlib import Path


def combine_files(input_dir, output_file, exclude_list, exclude_suffixes):
    input_path = Path(input_dir).resolve()
    output_path = Path(output_file).resolve()

    # Delete existing output file
    if output_path.exists():
        output_path.unlink()
        print(f"Deleted existing file: {output_file}")

    file_count = 0

    with open(output_path, "w", encoding="utf-8") as outfile:
        for path in input_path.rglob("*"):
            # Skip excluded directories / files by name
            if any(part in exclude_list for part in path.parts):
                continue

            # Skip common binary / generated frontend assets
            if path.suffix.lower() in exclude_suffixes:
                continue

            if path.is_file() and path != output_path:
                try:
                    relative_path = path.relative_to(input_path)
                    content = path.read_text(encoding="utf-8", errors="ignore")

                    outfile.write(f"\n===== FILE: {relative_path} =====\n\n")
                    outfile.write(content)
                    outfile.write("\n\n")

                    file_count += 1
                    print(f"Processed: {relative_path}")
                except Exception as e:
                    print(f"Skipped {path.name} due to error: {e}")

    print(f"\nCombined {file_count} files into {output_file}")


# --- Configuration for Frontend Monorepo ---
input_directory = "."
output_filename = "emakao_frontend_structure.txt"

to_exclude = {
    # Build & Version Control
    ".git",
    ".github",
    ".idea",
    ".vscode",
    ".next",
    ".turbo",
    "node_modules",
    "dist",
    "build",
    "coverage",

    # Mobile / Expo generated
    ".expo",
    ".expo-shared",
    "android",
    "ios",
    "mobile",
    "web",
    "web-resident",

    # OS files
    ".DS_Store",
    "thumbs.db",

    # Lock files & heavy manifests
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",

    # Environment & secrets
    ".env",
    ".env.local",
    ".env.test",
    ".env.prod",
    ".env.production",
    ".next"
    "packages",
    # Generated / combined outputs
    "combined_files.txt",
    "emakao_frontend_structure.txt",
}

binary_suffixes = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".mp4",
    ".mp3",
    ".pdf",
    ".zip",
}


if __name__ == "__main__":
    combine_files(input_directory, output_filename, to_exclude, binary_suffixes)
