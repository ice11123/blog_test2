#!/usr/bin/env python3
"""Perform a real stdio handshake with the installed Skill Seekers MCP server."""

from __future__ import annotations

import asyncio
import json
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


REQUIRED_TOOLS = {
    "package_skill",
    "scrape_codebase",
    "scrape_docs",
    "scrape_github",
    "scrape_pdf",
}


async def verify() -> dict[str, object]:
    parameters = StdioServerParameters(
        command=sys.executable,
        args=["-m", "skill_seekers.mcp.server_fastmcp"],
    )
    async with stdio_client(parameters) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            response = await session.list_tools()

    names = sorted(tool.name for tool in response.tools)
    missing = sorted(REQUIRED_TOOLS.difference(names))
    return {
        "handshake": "ok" if not missing else "missing_required_tools",
        "python": sys.executable,
        "tool_count": len(names),
        "required_tools": sorted(REQUIRED_TOOLS),
        "missing_tools": missing,
    }


async def main() -> int:
    try:
        result = await asyncio.wait_for(verify(), timeout=30)
    except asyncio.TimeoutError:
        print(json.dumps({"handshake": "timeout"}, ensure_ascii=False, indent=2))
        return 2
    except Exception as exc:  # The JSON result is easier for an Agent to parse.
        print(
            json.dumps(
                {"handshake": "error", "error_type": type(exc).__name__, "error": str(exc)},
                ensure_ascii=False,
                indent=2,
            )
        )
        return 2

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not result["missing_tools"] else 3


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
